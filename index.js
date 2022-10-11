import { Network, Alchemy } from "alchemy-sdk";
import { ethers } from 'ethers';
import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// lib
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// env vars
const alchemyKey = process.env.ALCHEMY_KEY_MAINNET;
const provider = new ethers.providers.AlchemyProvider("mainnet", alchemyKey);

// contract
const contractAddr = "0xd3E58Bf93A1ad3946bfD2D298b964d4eCe1A9E7E";
const eventTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const firstBlock = 15502633;
const lastBlock = "latest";

// filter events
const settings = {
  apiKey: alchemyKey,
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

// get logs
alchemy.core
  .getLogs({
    address: contractAddr,
    topics: [eventTopic],
    fromBlock: ethers.utils.hexlify(firstBlock),
    toBlock: lastBlock,
  })
  .then((value) => {
    var mints = [];
    console.log("Total Transactions: " + value.length)
    for (var i = 0; i < value.length; i++) {
      if (value[i].topics[1] === ethers.utils.hexZeroPad(ethers.BigNumber.from(0).toHexString(), 32)) {
        mints.push(ethers.utils.defaultAbiCoder.decode(['address'],value[i].topics[2])[0]);
      }
    }
    console.log("Total Mints: " + mints.length)
    let minters = mints.filter(onlyUnique);
    console.log("Unique Mints: " + minters.length)
    fs.writeFile('./minters.json', JSON.stringify(minters, null, 4), err => {
      if (err) {
        console.error(err);
      } else {
        console.log(minters);
      }
    });
  });
