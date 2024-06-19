const { ethers } = require("hardhat");

async function listenToProductAdded(store) {
    let addedProducts = [];
    store.on('ProductAdded', (id, name, quantity) => {
        console.log(`Product added: ID=${id}, Name=${name}, Quantity=${quantity}`);
        addedProducts.push({ id, name, quantity });
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    store.removeAllListeners('ProductAdded');

    return addedProducts;
}

async function listenToOneProductAdded(store) {
    return new Promise((resolve) => {
        store.once('ProductAdded', (id, name, quantity) => {
            console.log(`Product added: ID=${id}, Name=${name}, Quantity=${quantity}`);
            resolve({ id, name, quantity });
        })
    });
}

module.exports = {
    listenToProductAdded,
    listenToOneProductAdded
}
