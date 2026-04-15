import { CART_FRAGMENT } from "../fragments";

export const GET_CART = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
  ${CART_FRAGMENT}
`;
