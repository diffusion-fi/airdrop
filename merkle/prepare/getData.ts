const csv = require("csv-parser");
const fs = require("fs");
import { writeFileSync } from "fs";
import {ethers} from "ethers"
const currentData = require("./addresses.json");
const raw: any = [];

console.log(currentData.length);

fs.createReadStream("./airdrop.csv")
  .pipe(csv())
  .on("data", (data: any) => raw.push(data))
  .on("end", () => {  
    raw.map((x: any, i: any) => {
      // const amount = parseFloat(x.amount.replace(/,/g, '')) + "000000000000000000"
      const amount = ethers.utils.parseEther(x.amount)
      currentData.push({
        address: x.address.toLowerCase(),
        amount: amount.toString(),
        index: i,
      });
    });
    console.log(currentData.length);
    writeFileSync(`./addresses.json`, JSON.stringify(currentData));
  });
