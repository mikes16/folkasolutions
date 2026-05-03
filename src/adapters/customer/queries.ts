/**
 * GraphQL operation documents for the Shopify Customer Account API.
 *
 * Kept as plain string constants (rather than `gql` template tags) so the
 * adapter has no GraphQL-client dependency. Each document is paired with an
 * `unknown`-typed response shape declared in `mappers.ts`.
 *
 * Field naming notes:
 * - `emailAddress` and `phoneNumber` are nested objects in the Customer
 *   Account API, not scalars. The mappers unwrap them.
 * - `provinceCode: zoneCode` aliases the schema's `zoneCode` field back to
 *   the `provinceCode` shape the domain `Address` expects.
 * - Address mutations use input fields `phoneNumber` and `zoneCode`; the
 *   adapter translates `AddressInput.phone` and `.provinceCode` accordingly.
 */

// NOTE: acceptsMarketing isn't a top-level field on Customer in this API.
// The Customer Account API exposes marketing consent through a nested
// emailMarketingConsent object (likely { marketingState }). We don't read
// or write it for now; the Profile UI checkbox is a no-op pending a
// follow-up that adds the correct field selection and mutation input.
export const PROFILE_QUERY = `
  query CustomerProfile {
    customer {
      id
      emailAddress { emailAddress }
      firstName
      lastName
      phoneNumber { phoneNumber }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = `
  mutation CustomerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        emailAddress { emailAddress }
        firstName
        lastName
        phoneNumber { phoneNumber }
      }
      userErrors { field message }
    }
  }
`;

export const ORDERS_QUERY = `
  query CustomerOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          cursor
          node {
            id
            number
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice { amount currencyCode }
            statusPageUrl
            lineItems(first: 50) {
              edges {
                node {
                  title
                  variantTitle
                  quantity
                  price { amount currencyCode }
                  image { url }
                }
              }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export const ORDER_QUERY = `
  query CustomerOrder($id: ID!) {
    order(id: $id) {
      id
      number
      processedAt
      financialStatus
      fulfillmentStatus
      totalPrice { amount currencyCode }
      statusPageUrl
      lineItems(first: 50) {
        edges {
          node {
            title
            variantTitle
            quantity
            price { amount currencyCode }
            image { url }
          }
        }
      }
    }
  }
`;

export const ADDRESSES_QUERY = `
  query CustomerAddresses {
    customer {
      defaultAddress { id }
      addresses(first: 50) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            provinceCode: zoneCode
            countryCode: territoryCode
            zip
            phoneNumber
          }
        }
      }
    }
  }
`;

export const CREATE_ADDRESS_MUTATION = `
  mutation CustomerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        provinceCode: zoneCode
        countryCode: territoryCode
        zip
        phoneNumber
      }
      userErrors { field message }
    }
  }
`;

export const UPDATE_ADDRESS_MUTATION = `
  mutation CustomerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        provinceCode: zoneCode
        countryCode: territoryCode
        zip
        phoneNumber
      }
      userErrors { field message }
    }
  }
`;

export const DELETE_ADDRESS_MUTATION = `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors { field message }
    }
  }
`;
