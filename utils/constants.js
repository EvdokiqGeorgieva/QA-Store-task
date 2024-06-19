const INITIAL_PRODUCTS = [
    { NAME: 'Store 1', QUANTITY: 10 },
    { NAME: 'Store 2', QUANTITY: 15 }
];

const NEW_PRODUCT = {
    NAME: 'New Product',
    QUANTITY: 2
};

const NEW_QUANTITY = 15;

const NOT_EXISTING_PRODUCT = {
    NAME: 'Not Existing Product',
    ID: 12345,
    QUANTITY: 5
};

const ERRORS = {
    NOT_EXISTING_PRODUCT: 'This product does not exist!',
    CAN_BUY_SAME_PRODUCT_ONLY_ONCE: 'You cannot buy the same product more than once!',
    DENIED_REFUND: 'Sorry, your request for refund has been denied.',
    NO_ZERO_QUANTITY: 'Quantity can\'t be 0!'
}

module.exports = {
    INITIAL_PRODUCTS,
    NEW_PRODUCT,
    NEW_QUANTITY,
    NOT_EXISTING_PRODUCT,
    ERRORS
}
