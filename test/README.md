# Tests for Smart Contract Project
This project contains smart contracts and associated tests for the Store application

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed [Node.js](https://nodejs.org/en/download/) (v16 or later)
- You have installed [npm](https://www.npmjs.com/get-npm) (v7 or later)
- You have installed [Hardhat](https://hardhat.org/getting-started/)

## Installation

1. Clone the repository:
    ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository

2. Install the dependencies
    ```bash
    npm install

3. Compile Contracts
    ```bash
    npx hardhat compile

4. Start a Local Node
    ```bash
    npx hardhat node

5. Deploy Contracts
    ```bash
    npx hardhat ignition deploy ./ignition/modules/Store.js

6. Run Tests
    ```bash
    npm test