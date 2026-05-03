import { Customer } from "@/domain/customer/Customer";
import { CustomerId } from "@/domain/customer/CustomerId";
import { Email } from "@/domain/customer/Email";
import { Address } from "@/domain/customer/Address";
import {
  Order,
  type FinancialStatus,
  type FulfillmentStatus,
} from "@/domain/customer/Order";
import { OrderLineItem } from "@/domain/customer/OrderLineItem";
import { Money } from "@/domain/customer/Money";

/**
 * Wire shapes returned by the Shopify Customer Account API for the
 * operations defined in `queries.ts`.
 *
 * Declared here (rather than imported from a generated schema) because we
 * only need the subset the adapter actually reads. Keeping them local lets
 * the mapper functions stay narrowly typed without a GraphQL codegen step.
 */
export interface CustomerNode {
  id: string;
  emailAddress: { emailAddress: string };
  firstName: string | null;
  lastName: string | null;
  phoneNumber: { phoneNumber: string } | null;
  // acceptsMarketing isn't fetched yet (Customer Account API exposes it via
  // a different shape, emailMarketingConsent.marketingState). The domain
  // Customer.acceptsMarketing is set to false by the mapper until we wire
  // the real selection in a follow-up.
}

export interface AddressNode {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  provinceCode: string;
  countryCode: string;
  zip: string;
  phoneNumber: string | null;
}

export interface MoneyNode {
  amount: string;
  currencyCode: string;
}

export interface OrderLineItemNode {
  title: string;
  variantTitle: string | null;
  quantity: number;
  price: MoneyNode;
  image: { url: string } | null;
}

export interface OrderNode {
  id: string;
  number: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: MoneyNode;
  // Customer Account API exposes the order detail URL as `statusPageUrl`,
  // not `customerOrderUrl`. Mapped to `customerOrderUrl` on the domain side.
  statusPageUrl: string;
  lineItems: { edges: Array<{ node: OrderLineItemNode }> };
}

/**
 * Maps a Customer Account API customer node to the domain `Customer`.
 *
 * Unwraps the nested `emailAddress`/`phoneNumber` objects the API returns
 * and converts an absent phone (`null` wrapper) into the domain's `null`
 * primitive.
 */
export function mapCustomer(node: CustomerNode): Customer {
  return Customer.create({
    id: CustomerId.from(node.id),
    email: Email.from(node.emailAddress.emailAddress),
    firstName: node.firstName,
    lastName: node.lastName,
    phone: node.phoneNumber?.phoneNumber ?? null,
    // Pending wiring of emailMarketingConsent.marketingState; defaulting
    // to false so the domain shape is satisfied without lying about state.
    acceptsMarketing: false,
  });
}

/**
 * Maps a single address node to the domain `Address`.
 *
 * The Shopify GID for the address is intentionally NOT carried into the
 * domain object — `Address` is content-only. Use `mapAddressWithId` when
 * the gateway needs the id alongside (e.g. to pair against the default
 * address id for default-detection).
 */
export function mapAddress(node: AddressNode): Address {
  return Address.create({
    firstName: node.firstName,
    lastName: node.lastName,
    company: node.company ?? undefined,
    address1: node.address1,
    address2: node.address2 ?? undefined,
    city: node.city,
    provinceCode: node.provinceCode,
    countryCode: node.countryCode,
    zip: node.zip,
    phone: node.phoneNumber ?? undefined,
  });
}

/**
 * Pairs a mapped `Address` with its Shopify GID. Useful at the gateway
 * boundary when the caller needs to correlate addresses with a default
 * address id.
 */
export function mapAddressWithId(node: AddressNode): {
  id: string;
  address: Address;
} {
  return { id: node.id, address: mapAddress(node) };
}

export function mapMoney(node: MoneyNode): Money {
  return Money.of(node.amount, node.currencyCode);
}

export function mapOrderLineItem(node: OrderLineItemNode): OrderLineItem {
  return OrderLineItem.create({
    title: node.title,
    variantTitle: node.variantTitle,
    quantity: node.quantity,
    unitPrice: mapMoney(node.price),
    // Customer Account API line items don't expose a product reference, so
    // we can't deep-link from an order back to the product detail page.
    // Acceptable limitation: order detail still shows title + image + price.
    productHandle: null,
    imageUrl: node.image?.url ?? null,
  });
}

/**
 * Maps an order node to the domain `Order`.
 *
 * Shopify returns financial/fulfillment statuses as UPPERCASE enum values
 * (e.g. `PAID`, `FULFILLED`). The domain types are lowercase string unions,
 * so we lowercase here. The cast is acceptable because Shopify guarantees
 * the enum values, and any unexpected variant will surface immediately
 * when an exhaustive switch in the UI hits the default branch.
 */
export function mapOrder(node: OrderNode): Order {
  return Order.create({
    id: node.id,
    orderNumber: node.number,
    processedAt: node.processedAt,
    financialStatus: node.financialStatus.toLowerCase() as FinancialStatus,
    fulfillmentStatus: node.fulfillmentStatus.toLowerCase() as FulfillmentStatus,
    totalPrice: mapMoney(node.totalPrice),
    lineItems: node.lineItems.edges.map((edge) => mapOrderLineItem(edge.node)),
    customerOrderUrl: node.statusPageUrl,
  });
}
