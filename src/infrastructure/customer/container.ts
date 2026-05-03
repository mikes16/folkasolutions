import { ShopifyOAuthClient } from "@/adapters/customer/ShopifyOAuthClient";
import { ShopifyCustomerAccountGateway } from "@/adapters/customer/ShopifyCustomerAccountGateway";
import { CookieSessionStore } from "@/adapters/customer/CookieSessionStore";
import { LoginCustomer } from "@/application/customer/LoginCustomer";
import { HandleOAuthCallback } from "@/application/customer/HandleOAuthCallback";
import { RefreshAccessToken } from "@/application/customer/RefreshAccessToken";
import { LogoutCustomer } from "@/application/customer/LogoutCustomer";
import { GetCustomerProfile } from "@/application/customer/GetCustomerProfile";
import { GetCustomerOrders } from "@/application/customer/GetCustomerOrders";
import { GetOrderDetail } from "@/application/customer/GetOrderDetail";
import { ListCustomerAddresses } from "@/application/customer/ListCustomerAddresses";
import { UpdateCustomerProfile } from "@/application/customer/UpdateCustomerProfile";
import { CreateCustomerAddress } from "@/application/customer/CreateCustomerAddress";
import { UpdateCustomerAddress } from "@/application/customer/UpdateCustomerAddress";
import { DeleteCustomerAddress } from "@/application/customer/DeleteCustomerAddress";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function makeContainer() {
  const oauth = new ShopifyOAuthClient({
    clientId: requireEnv("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID"),
    authUrl: requireEnv("SHOPIFY_CUSTOMER_AUTH_URL"),
    tokenUrl: requireEnv("SHOPIFY_CUSTOMER_TOKEN_URL"),
    logoutUrl: requireEnv("SHOPIFY_CUSTOMER_LOGOUT_URL"),
  });
  const gateway = new ShopifyCustomerAccountGateway(
    requireEnv("SHOPIFY_CUSTOMER_ACCOUNT_API_URL"),
  );
  const session = new CookieSessionStore(requireEnv("CUSTOMER_SESSION_SECRET"));
  const refresh = new RefreshAccessToken(oauth, session);

  return {
    login: new LoginCustomer(oauth),
    handleCallback: new HandleOAuthCallback(oauth, session),
    refresh,
    logout: new LogoutCustomer(oauth, session),
    getProfile: new GetCustomerProfile(refresh, gateway),
    getOrders: new GetCustomerOrders(refresh, gateway),
    getOrder: new GetOrderDetail(refresh, gateway),
    listAddresses: new ListCustomerAddresses(refresh, gateway),
    updateProfile: new UpdateCustomerProfile(refresh, gateway),
    createAddress: new CreateCustomerAddress(refresh, gateway),
    updateAddress: new UpdateCustomerAddress(refresh, gateway),
    deleteAddress: new DeleteCustomerAddress(refresh, gateway),
  };
}

export type CustomerContainer = ReturnType<typeof makeContainer>;
