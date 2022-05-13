require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("dotenv").config({ path: ".env" });

module.exports = {
  networks: {
    hardhat: {},
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4,
      saveDeployments: true,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: "0.8.4",
};
