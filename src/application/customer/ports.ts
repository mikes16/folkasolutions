import type { Customer } from "@/domain/customer/Customer";
import type { Order } from "@/domain/customer/Order";
import type { Address, AddressInput } from "@/domain/customer/Address";
import type { ProfileUpdate } from "@/domain/customer/Customer";

/**
 * Result of building an OAuth authorize URL.
 *
 * The application layer only describes what it needs from an OAuth client.
 * Concrete generation of PKCE verifier, state, and nonce is the adapter's
 * responsibility. The use case stores the verifier/state alongside the
 * pending session so the callback can validate the round-trip.
 */
export interface OAuthAuthorizeUrl {
  url: string;
  pkceVerifier: string;
  state: string;
  nonce: string;
}

/**
 * Token bundle returned by an OAuth exchange or refresh.
 *
 * `expiresAt` is an absolute `Date` rather than `expires_in` seconds so the
 * application layer does not need to track when the response was received.
 */
export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: Date;
}

/**
 * Port for the OAuth/OIDC client used by login, callback, refresh, and
 * logout flows. Implementations live in the adapter layer.
 */
export interface OAuthClient {
  buildAuthorizeUrl(args: {
    redirectUri: string;
    locale: string;
  }): Promise<OAuthAuthorizeUrl>;
  exchangeCode(args: {
    code: string;
    pkceVerifier: string;
    redirectUri: string;
  }): Promise<TokenSet>;
  refresh(refreshToken: string): Promise<TokenSet>;
  revoke(refreshToken: string): Promise<void>;
}

/**
 * Port for the Shopify Customer Account API gateway. Wraps profile,
 * orders, and address operations so use cases stay platform-agnostic.
 */
export interface CustomerAccountGateway {
  getProfile(accessToken: string): Promise<Customer>;
  updateProfile(args: {
    accessToken: string;
    update: ProfileUpdate;
  }): Promise<Customer>;
  getOrders(args: {
    accessToken: string;
    cursor: string | null;
    pageSize: number;
  }): Promise<{
    orders: Order[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }>;
  getOrder(args: { accessToken: string; orderId: string }): Promise<Order>;
  listAddresses(accessToken: string): Promise<{
    addresses: Array<{ id: string; address: Address }>;
    defaultAddressId: string | null;
  }>;
  createAddress(args: {
    accessToken: string;
    input: AddressInput;
    setDefault: boolean;
  }): Promise<Address>;
  updateAddress(args: {
    accessToken: string;
    addressId: string;
    input: AddressInput;
  }): Promise<Address>;
  deleteAddress(args: {
    accessToken: string;
    addressId: string;
  }): Promise<void>;
}

/**
 * Port for the session store that persists the authenticated `TokenSet`.
 * Adapter implementations may use encrypted cookies, KV stores, etc.
 */
export interface SessionStore {
  read(): Promise<TokenSet | null>;
  write(tokens: TokenSet): Promise<void>;
  clear(): Promise<void>;
}
