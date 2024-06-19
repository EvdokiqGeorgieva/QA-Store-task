const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { mine } = require("@nomicfoundation/hardhat-network-helpers");
  const { ethers } = require("hardhat");
  const { expect } = require("chai");
  const { NEW_PRODUCT, INITIAL_PRODUCTS, NEW_QUANTITY, NOT_EXISTING_PRODUCT, ERRORS } = require("../utils/constants.js");
  const { listenToProductAdded, listenToOneProductAdded } = require("../utils/utils.js")
describe('Store Contract', function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    
    async function deployWithProducts() {

        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, address1, address2, address3] = await ethers.getSigners();

        const Store = await ethers.getContractFactory("Store");
        const store = await Store.deploy(owner.address);

        const productAddedEvents = listenToProductAdded(store);

        for (const product of INITIAL_PRODUCTS) {
            await store.addProduct(product.NAME, product.QUANTITY);
        }

        const addedProductIds = await productAddedEvents;

        return { store, owner, otherAccount, address1, address2, address3, addedProductIds };
    };

    describe('Administrator tests', function() {
        it('Add new products and products quantity successfully', async function() {
            const { store } = await loadFixture(deployWithProducts);
            const initialProducts = await store.getAllProducts();

            await store.addProduct(NEW_PRODUCT.NAME, NEW_PRODUCT.QUANTITY);

            const addedProduct = await store.getProductByName(NEW_PRODUCT.NAME);
            const products = await store.getAllProducts();

            expect(addedProduct.name).to.equal(NEW_PRODUCT.NAME);
            expect(addedProduct.quantity).to.equal(NEW_PRODUCT.QUANTITY);
            expect(products.length).to.equal(initialProducts.length + 1);
        });

        it('Administrator can not add the same product with the same quantity twice', async function() {
            const { store } = await loadFixture(deployWithProducts);
            const initialProducts = await store.getAllProducts();

            await store.addProduct(INITIAL_PRODUCTS[0].NAME, INITIAL_PRODUCTS[0].QUANTITY);

            const products = await store.getAllProducts();

            expect(products.length).to.equal(initialProducts.length);
            for (const p of initialProducts) {
                expect(p.NAME).to.equal(products.NAME);
                expect(p.QUANTITY).to.equal(products.QUANTITY);
            };
        });

        it('Administrator can not add the same product twice, only quantity', async function() {
            const { store } = await loadFixture(deployWithProducts);
            const initialProducts = await store.getAllProducts();

            await store.addProduct(INITIAL_PRODUCTS[0].NAME, NEW_QUANTITY);

            const updatedProduct = await store.getProductByName(INITIAL_PRODUCTS[0].NAME);
            const products = await store.getAllProducts();

            expect(products.length).to.equal(initialProducts.length);
            expect(updatedProduct.name).to.equal(INITIAL_PRODUCTS[0].NAME);
            expect(updatedProduct.quantity).to.equal(NEW_QUANTITY);
        });

        it('Administrator can not add new quantity for not existing product', async function() {
            const { store } = await loadFixture(deployWithProducts);
            const initialProducts = await store.getAllProducts();

            try {
                await store.updateProductQuantity(NOT_EXISTING_PRODUCT.ID, NEW_QUANTITY);
                expect.fail("Expected updateProductQuantity to throw an error, but it didn't");
            } catch (error) {
                expect(error.message).to.include(ERRORS.NOT_EXISTING_PRODUCT);
                const products = await store.getAllProducts();
                expect(products.length).to.equal(initialProducts.length);
                for (const p of initialProducts) {
                    expect(p.NAME).to.equal(products.NAME);
                    expect(p.QUANTITY).to.equal(products.QUANTITY);
                };
            }
        });
    });

    describe('Buyers tests', function() {
        it('Buyers can see available products', async function() {
            const { store, otherAccount } = await loadFixture(deployWithProducts);

            const initialProducts = await store.connect(otherAccount).getAllProducts();

            expect(initialProducts.length).to.equal(INITIAL_PRODUCTS.length);
            for (const p of initialProducts) {
                expect(p.NAME).to.equal(INITIAL_PRODUCTS.NAME);
                expect(p.QUANTITY).to.equal(INITIAL_PRODUCTS.QUANTITY);
            };
        });

        it('Buyers can buy products by id', async function() {
            const { store, otherAccount, addedProductIds } = await loadFixture(deployWithProducts);
            const buyerBalanceBeforeBuy = await ethers.provider.getBalance(otherAccount.address);
            const productToBuyId = Number(addedProductIds[0].id);
            const productToBuyQuantity = Number(addedProductIds[0].quantity);
           
            await store.connect(otherAccount).buyProduct(productToBuyId);

            const productAfterBuy = await store.connect(otherAccount).getProductById(productToBuyId);
            const buyerBalanceAfterBuy = await ethers.provider.getBalance(otherAccount.address);

            expect(buyerBalanceBeforeBuy).to.be.greaterThan(buyerBalanceAfterBuy);
            expect(productAfterBuy.quantity).to.equal(productToBuyQuantity - 1);
        });

        it('Buyers can not buy the same product more than once', async function() {
            const { store, otherAccount, addedProductIds } = await loadFixture(deployWithProducts);
            const buyerBalanceBeforeBuy = await ethers.provider.getBalance(otherAccount.address);
            const productToBuyId = Number(addedProductIds[0].id);
            const productToBuyQuantity = Number(addedProductIds[0].quantity);
           
            await store.connect(otherAccount).buyProduct(productToBuyId);

            try {
                await store.connect(otherAccount).buyProduct(productToBuyId);
                expect.fail("Expected buyProduct to throw an error, but it didn't");
            } catch (error) {
                expect(error.message).to.include(ERRORS.CAN_BUY_SAME_PRODUCT_ONLY_ONCE);
                const productAfterBuy = await store.connect(otherAccount).getProductById(productToBuyId);
                const buyerBalanceAfterBuy = await ethers.provider.getBalance(otherAccount.address);
    
                expect(buyerBalanceBeforeBuy).to.be.greaterThan(buyerBalanceAfterBuy);
                expect(productAfterBuy.quantity).to.equal(productToBuyQuantity - 1);
            }
        });

        // I think that the contract for refundProduct is missing logic to update the buyer balance and the product quantity
        // This is the reason this test fails
        it('Buyers can return products', async function() {
            const { store, otherAccount, addedProductIds } = await loadFixture(deployWithProducts);
            const productToBuyId = Number(addedProductIds[0].id);
            const productToBuyQuantity = Number(addedProductIds[0].quantity);

            await store.connect(otherAccount).buyProduct(productToBuyId);
            
            const productAfterBuy = await store.connect(otherAccount).getProductById(productToBuyId);
            const buyerBalanceAfterBuy = await ethers.provider.getBalance(otherAccount.address);

            expect(productAfterBuy.quantity).to.equal(productToBuyQuantity - 1);

            await store.connect(otherAccount).refundProduct(productToBuyId);
            const buyerBalanceAfterReturn = await ethers.provider.getBalance(otherAccount.address);
            const productAfterReturn = await store.connect(otherAccount).getProductById(productToBuyId)

            expect(buyerBalanceAfterReturn).to.be.greaterThan(buyerBalanceAfterBuy);
            expect(productAfterReturn.quantity).to.equal(productToBuyQuantity);
        });

        it('Buyers cannot return products after 100 blocks', async function() {
            const { store, otherAccount, addedProductIds } = await loadFixture(deployWithProducts);
            const buyerBalanceBeforeBuy = await ethers.provider.getBalance(otherAccount.address);
            const productToBuyId = Number(addedProductIds[0].id);
            const productToBuyQuantity = Number(addedProductIds[0].quantity);

            // Get initial block number
            const initialBlockNumber = await ethers.provider.getBlockNumber();
            console.log(`Initial block number: ${initialBlockNumber}`);

            await store.connect(otherAccount).buyProduct(productToBuyId);

            // Get block number after 100 blocktime
            await mine(101);
            const blockNumberAfterIncrease = await ethers.provider.getBlockNumber();
            console.log(`Block number after increase: ${blockNumberAfterIncrease}`);

            try {
                await store.connect(otherAccount).refundProduct(productToBuyId);
                expect.fail("Expected refundProduct to throw an error, but it didn't");
            } catch (error) {
                expect(error.message).to.include(ERRORS.DENIED_REFUND);
                const productAfterBuy = await store.connect(otherAccount).getProductById(productToBuyId);
                const buyerBalanceAfterBuy = await ethers.provider.getBalance(otherAccount.address);
    
                expect(buyerBalanceBeforeBuy).to.be.greaterThan(buyerBalanceAfterBuy);
                expect(productAfterBuy.quantity).to.equal(productToBuyQuantity - 1);
            }
        });

        // I think that the contract for refundProduct is missing logic to update the buyer balance and the product quantity
        // This is the reason this test fails
        // Whenever fixed, the test should be revised
        it('Buyers should not be able to buy a product more times than the quantity in the store unless a product is returned or added by the administrator (owner)', async function() {
            const { store, owner, otherAccount, address1, address2 } = await loadFixture(deployWithProducts);

            // Add new product with quantity 2
            const addedProductPromise = listenToOneProductAdded(store);
            await store.connect(owner).addProduct(NEW_PRODUCT.NAME, NEW_PRODUCT.QUANTITY);
            const addedProduct = await addedProductPromise;
            const productToBuyId = Number(addedProduct.id);
            const productToBuyQuantity = Number(addedProduct.quantity);

            // Buy all available quantities
            await store.connect(otherAccount).buyProduct(productToBuyId);
            await store.connect(address1).buyProduct(productToBuyId);

            // Try to buy the product one more tyme
            try {
                await store.connect(address2).buyProduct(productToBuyId);
                expect.fail("Expected buyProduct to throw an error, but it didn't");
            } catch (error) {
                expect(error.message).to.include(ERRORS.NO_ZERO_QUANTITY);
            }
            
            // return product
            await store.connect(otherAccount).refundProduct(productToBuyId);
            const productAfterReturn = await store.connect(otherAccount).getProductById(productToBuyId)
            expect(productAfterReturn.quantity).to.equal(productToBuyQuantity - 1);

            // add new product quantity
            await store.connect(owner).addProduct(NEW_PRODUCT.NAME, 1);

            // buy the newly added quantity
            await store.connect(address2).buyProduct(productToBuyId);
            const productAfterBuy = await store.connect(owner).getProductByName(NEW_PRODUCT.NAME);
            expect(Number(productAfterBuy.quantity)).to.equal(0);
        });
    });
});
