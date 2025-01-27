require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    dfc: {
      url: process.env.RPC_URL || "https://node.dragonfly-chain.com",
      chainId: parseInt(process.env.CHAIN_ID || "920"),
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: parseInt(process.env.GAS_LIMIT || "8000000"),
      gasPrice: parseInt(process.env.GAS_PRICE || "2000000000")
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
