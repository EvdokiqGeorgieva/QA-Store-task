const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const INITIAL_ADMIN_ADDRESS = "0x1234567890123456789012345678901234567890";

module.exports = buildModule("StoreModule", (m) => {
    // Define parameters that can be overriden when deployed
    const adminAddress = m.getParameter("adminAddress", INITIAL_ADMIN_ADDRESS);

    //Deploy contract
    const store = m.contract("Store", [adminAddress]);

    return { store };
});
