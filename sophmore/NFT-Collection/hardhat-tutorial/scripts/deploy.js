// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
require("dotenv").config({path: ".env"});
const { WHITE_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  // Address of the whitelist contract
  const whitelistContract = WHITE_CONTRACT_ADDRESS;
  // url from where we can extract the metadata for a crypto Dev NFT
  const metadataURL = METADATA_URL;

  // used to deploy new smart contracts
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

  //Deploy the contract
  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataURL, whitelistContract
  );

  // wait for it to finish deploying
  await deployedCryptoDevsContract.deployed();

  // print the address for the deployrd contract
  console.log(
    "Crypto Devs Contract Address:",
    deployedCryptoDevsContract.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
  console.error(error);
  process.exit(1);
});
