import { task, HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
const rootHash = require("./merkle/data/rootHash");
import { ethers } from "ethers";
import "@ericxstone/hardhat-blockscout-verify";
import { SOLIDITY_VERSION, EVM_VERSION } from "@ericxstone/hardhat-blockscout-verify";

require("dotenv").config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const BINANCE_PRIVATE_KEY = process.env.BINANCE_PRIVATE_KEY;
//0xA2D0E1e67D08d2D1B8E1996034551dFb881138Fa
const EVMOSTEST_PRIVATE_KEY = process.env.EVMOSTEST_PRIVATE_KEY;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy", "Deploys new airdrop")
  .addParam("token", "The diffusion token address")
  .addParam("treasury", "The diffusion multisig address")
  .setAction(async (args, hre) => {
    // We get the contract to deploy
    const Airdrop = await hre.ethers.getContractFactory("Airdrop");
    const airdrop = await Airdrop.deploy(args.token, rootHash, args.treasury);

    console.log("Airdrop deployed to:", airdrop.address);
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  blockscoutVerify: {
    blockscoutURL: "https://evm.evmos.org/",
    contracts: {
      Airdrop: {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_7_3, // checkout enum SOLIDITY_VERSION
        optimization: false,
        evmVersion: EVM_VERSION.EVM_ISTANBUL, // checkout enum SOLIDITY_VERSION
        optimizationRuns: 0,
      },
    },
  },
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`${RINKEBY_PRIVATE_KEY}`],
    },
    test: {
      url: `https://eth.bd.evmos.dev:8545`,
      accounts: [`${EVMOSTEST_PRIVATE_KEY}`],
    },
    evmos: {
      url: `https://eth.bd.evmos.org:8545/`,
      accounts: [`${EVMOSTEST_PRIVATE_KEY}`],
      chainId: 9001,
    },
    // mainnet: {
    //   url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    //   accounts: [`${MAINNET_PRIVATE_KEY}`],
    // },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`${GOERLI_PRIVATE_KEY}`],
      //   gasPrice: ethers.utils.parseUnits("200", "gwei").toNumber(),
    },
    binance: {
      url: `https://bsc-dataseed1.defibit.io/`,
      accounts: [`${BINANCE_PRIVATE_KEY}`],
      timeout: 200000000,
      gasPrice: ethers.utils.parseUnits("20", "gwei").toNumber(),
    },
    ganache: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  solidity: "0.7.3",
  mocha: {
    timeout: 2000000000,
  },
};

export default config;
