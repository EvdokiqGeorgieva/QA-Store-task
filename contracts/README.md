# Store contract

Functionality:

- The administrator (owner) of the store should be able to add new products and the quantity of them.
- The administrator should not be able to add the same product twice, just quantity.
- Buyers (clients) should be able to see the available products and buy them by their id.
- Buyers should be able to return products if they are not satisfied (within a certain period in blocktime: 100 blocks).
- A client cannot buy the same product more than one time.
- The clients should not be able to buy a product more times than the quantity in the store unless a product is returned or added by the administrator (owner)

## Methods

### External

| Name                    | Restriction              | Description                                                                     |
| ----------------------- | ------------------------ | ------------------------------------------------------------------------------- |
| `addProduct`            | Only owner can call this | Adds new product to the store, if product already exists, update it's quantity. |
| `updateProductQuantity` | Only owner can call this | Update quantity of already added product in the store.                          |
| `buyProduct`            | No                       | Buy product from the store, if it exists and it has enough quantity.            |
| `refundProduct`         | No                       | Refund a product within the specified blocktime.                                |
| `setRefundPolicyNumber` | Only owner can call this | Set specific blocktime for refunds.                                             |
| `getProductByName`      | No                       | Get product information by it's name.                                           |
| `getProductById`        | No                       | Get product information by it's id.                                             |
| `getProductBuyersById`  | No                       | Get product buyers by product id.                                               |
| `getAllProducts`        | No                       | Get all available products in the store.                                        |
