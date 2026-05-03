import type { CustomerAccountGateway } from "@/application/customer/ports";
import type { Customer, ProfileUpdate } from "@/domain/customer/Customer";
import type { Order } from "@/domain/customer/Order";
import type { Address, AddressInput } from "@/domain/customer/Address";
import {
  ADDRESSES_QUERY,
  CREATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  ORDERS_QUERY,
  ORDER_QUERY,
  PROFILE_QUERY,
  UPDATE_ADDRESS_MUTATION,
  UPDATE_PROFILE_MUTATION,
} from "./queries";
import {
  mapAddress,
  mapAddressWithId,
  mapCustomer,
  mapOrder,
  type AddressNode,
  type CustomerNode,
  type OrderNode,
} from "./mappers";

/**
 * Shape of every Shopify Customer Account API response. `data` and
 * `errors` are mutually optional in the GraphQL spec; the adapter rejects
 * the request if either `errors[]` is non-empty or `data` is missing.
 */
interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface UserError {
  field: string[] | null;
  message: string;
}

interface ProfileQueryData {
  customer: CustomerNode;
}

interface UpdateProfileMutationData {
  customerUpdate: {
    customer: CustomerNode;
    userErrors: UserError[];
  };
}

interface OrdersQueryData {
  customer: {
    orders: {
      edges: Array<{ cursor: string; node: OrderNode }>;
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
}

interface OrderQueryData {
  order: OrderNode | null;
}

interface AddressesQueryData {
  customer: {
    defaultAddress: { id: string } | null;
    addresses: { edges: Array<{ node: AddressNode }> };
  };
}

interface CreateAddressMutationData {
  customerAddressCreate: {
    customerAddress: AddressNode;
    userErrors: UserError[];
  };
}

interface UpdateAddressMutationData {
  customerAddressUpdate: {
    customerAddress: AddressNode;
    userErrors: UserError[];
  };
}

interface DeleteAddressMutationData {
  customerAddressDelete: {
    deletedAddressId: string | null;
    userErrors: UserError[];
  };
}

/**
 * GraphQL input shape for `customerUpdate`. The Shopify schema wraps phone
 * in a `phoneNumber` object and exposes only the four mutable profile
 * fields. Built dynamically from `ProfileUpdate` so we only send keys the
 * caller actually provided (PATCH semantics).
 */
interface CustomerUpdateInput {
  firstName?: string | null;
  lastName?: string | null;
  // phoneNumber and acceptsMarketing aren't fields on CustomerUpdateInput.
  // - Phone changes require a separate verification flow in the Customer
  //   Account API (SMS verification) to prevent account takeover.
  // - Marketing consent goes through emailMarketingConsent.
  // Both are read-only via the basic updateProfile mutation. The Profile UI
  // surfaces them but writes are silently dropped. Wiring the verification
  // flow and consent mutation is a follow-up.
}

/**
 * GraphQL input shape for `customerAddressCreate` / `customerAddressUpdate`.
 * Field name translations from the domain `AddressInput`:
 *   - `phone` becomes `phoneNumber`
 *   - `provinceCode` becomes `zoneCode`
 *   - `countryCode` becomes `territoryCode`
 * This matches the Customer Account API's `CustomerAddressInput` exactly.
 */
interface CustomerAddressInput {
  firstName: string;
  lastName: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  zoneCode: string;
  territoryCode: string;
  zip: string;
  phoneNumber?: string | null;
}

function toCustomerUpdateInput(update: ProfileUpdate): CustomerUpdateInput {
  const input: CustomerUpdateInput = {};
  if ("firstName" in update) input.firstName = update.firstName ?? null;
  if ("lastName" in update) input.lastName = update.lastName ?? null;
  // phone and acceptsMarketing intentionally dropped (see CustomerUpdateInput
  // comment above). Profile UI accepts them but they no-op until proper
  // verification + consent flows are implemented.
  return input;
}

function toCustomerAddressInput(input: AddressInput): CustomerAddressInput {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    company: input.company ?? null,
    address1: input.address1,
    address2: input.address2 ?? null,
    city: input.city,
    zoneCode: input.provinceCode,
    territoryCode: input.countryCode,
    zip: input.zip,
    phoneNumber: input.phone ?? null,
  };
}

/**
 * Throws a single error message that aggregates every `userErrors` entry
 * returned by a mutation. Mutations may surface multiple validation errors
 * at once (e.g. `firstName` and `zip` both invalid), so we join rather
 * than only reporting the first.
 */
function assertNoUserErrors(errors: UserError[]): void {
  if (errors.length === 0) return;
  throw new Error(errors.map((e) => e.message).join("; "));
}

/**
 * Adapter implementation of `CustomerAccountGateway` that talks to
 * Shopify's Customer Account API over GraphQL.
 *
 * Stateless: the API URL is injected at construction time and every
 * request takes the access token explicitly. This keeps the gateway safe
 * to share across requests and easy to test (mock `fetch`).
 *
 * No external GraphQL client: we hit `fetch` directly because the
 * operations and parsing logic are simple enough that a client library
 * would only add weight.
 */
export class ShopifyCustomerAccountGateway implements CustomerAccountGateway {
  constructor(private readonly apiUrl: string) {}

  /**
   * Issues a GraphQL request and unwraps the response. Throws when the
   * HTTP layer fails, when the GraphQL layer reports `errors[]`, or when
   * the server returns no `data`. Callers can rely on the resolved value
   * being the typed `data` payload.
   */
  private async query<T>(
    accessToken: string,
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      // Capture the response body so the actual GraphQL error (field name
      // mismatch, scope issue, etc.) shows up in Vercel runtime logs.
      const body = await res.text().catch(() => "<unable to read body>");
      throw new Error(`Customer Account API ${res.status}: ${body}`);
    }
    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
      throw new Error(json.errors.map((e) => e.message).join("; "));
    }
    if (!json.data) {
      throw new Error("Customer Account API returned no data");
    }
    return json.data;
  }

  async getProfile(accessToken: string): Promise<Customer> {
    const data = await this.query<ProfileQueryData>(accessToken, PROFILE_QUERY);
    return mapCustomer(data.customer);
  }

  async updateProfile(args: {
    accessToken: string;
    update: ProfileUpdate;
  }): Promise<Customer> {
    const data = await this.query<UpdateProfileMutationData>(
      args.accessToken,
      UPDATE_PROFILE_MUTATION,
      { input: toCustomerUpdateInput(args.update) },
    );
    assertNoUserErrors(data.customerUpdate.userErrors);
    return mapCustomer(data.customerUpdate.customer);
  }

  async getOrders(args: {
    accessToken: string;
    cursor: string | null;
    pageSize: number;
  }): Promise<{
    orders: Order[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> {
    const data = await this.query<OrdersQueryData>(
      args.accessToken,
      ORDERS_QUERY,
      { first: args.pageSize, after: args.cursor },
    );
    const { edges, pageInfo } = data.customer.orders;
    const orders = edges.map((edge) => mapOrder(edge.node));
    // When `hasNextPage` is false, `endCursor` is irrelevant. Surface
    // `null` so callers don't accidentally pass a stale cursor back.
    const nextCursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    return { orders, nextCursor, hasNextPage: pageInfo.hasNextPage };
  }

  async getOrder(args: {
    accessToken: string;
    orderId: string;
  }): Promise<Order> {
    const data = await this.query<OrderQueryData>(
      args.accessToken,
      ORDER_QUERY,
      { id: args.orderId },
    );
    if (!data.order) {
      throw new Error(`Order ${args.orderId} not found`);
    }
    return mapOrder(data.order);
  }

  async listAddresses(accessToken: string): Promise<{
    addresses: Array<{ id: string; address: Address }>;
    defaultAddressId: string | null;
  }> {
    const data = await this.query<AddressesQueryData>(
      accessToken,
      ADDRESSES_QUERY,
    );
    const addresses = data.customer.addresses.edges.map((edge) =>
      mapAddressWithId(edge.node),
    );
    return {
      addresses,
      defaultAddressId: data.customer.defaultAddress?.id ?? null,
    };
  }

  async createAddress(args: {
    accessToken: string;
    input: AddressInput;
    setDefault: boolean;
  }): Promise<Address> {
    const data = await this.query<CreateAddressMutationData>(
      args.accessToken,
      CREATE_ADDRESS_MUTATION,
      {
        address: toCustomerAddressInput(args.input),
        defaultAddress: args.setDefault,
      },
    );
    assertNoUserErrors(data.customerAddressCreate.userErrors);
    return mapAddress(data.customerAddressCreate.customerAddress);
  }

  async updateAddress(args: {
    accessToken: string;
    addressId: string;
    input: AddressInput;
  }): Promise<Address> {
    const data = await this.query<UpdateAddressMutationData>(
      args.accessToken,
      UPDATE_ADDRESS_MUTATION,
      {
        addressId: args.addressId,
        address: toCustomerAddressInput(args.input),
      },
    );
    assertNoUserErrors(data.customerAddressUpdate.userErrors);
    return mapAddress(data.customerAddressUpdate.customerAddress);
  }

  async deleteAddress(args: {
    accessToken: string;
    addressId: string;
  }): Promise<void> {
    const data = await this.query<DeleteAddressMutationData>(
      args.accessToken,
      DELETE_ADDRESS_MUTATION,
      { addressId: args.addressId },
    );
    assertNoUserErrors(data.customerAddressDelete.userErrors);
  }
}
