const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

const contractAbi = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      "../artifacts/contracts/AmazonCoin.sol/AmazonCoin.json"
    )
  )
).abi;

const contractAddress = "0x76eC59E930e90Cfe8F1e75B8cf5fe76D3e8993C7";
const provider = new ethers.providers.JsonRpcProvider(
  "https://rinkeby.infura.io/v3/8a9235fb47ae47b7a35ad33a69f9805f"
);
const account = "0x32Bd6e8ac4523fe5806d72Ff2895b267FCF8b866";

const main = async () => {
  const contract = new ethers.Contract(contractAddress, contractAbi, provider);
  const contractName = await contract.name();
  const contractSymbol = await contract.symbol();
  const totalSupply = await contract.totalSupply();
  //   const totalTokens = ethers.utils.formatUnits(totalSupply, 18);
  const balanceOf = await contract.balanceOf(account);
  console.log(
    "##contractDetails",
    contractName,
    contractSymbol,
    totalSupply.toString(),
    balanceOf.toString()
  );
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log("##err", err);
    process.exit(1);
  });
