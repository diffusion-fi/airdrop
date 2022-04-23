const data = require("./prepare/addresses.json");
// const data2 = require("./data2.json");
import { writeFileSync } from "fs";
import { ethers } from "ethers";
import { addIndexToLeaves } from "./helpers";

const findDuplicates = (arr: any): any => {
  const onlyAddresss: any = [];
  arr.map((x: any) => {
    onlyAddresss.push(x.address);
  });
  const newArr = Array.from(new Set(onlyAddresss));
  console.log(newArr.length, onlyAddresss.length);
  if (newArr.length !== onlyAddresss.length) {
    throw new Error("still duplicates");
  }
};

const validateAddress = (finalArray: any) => {
  let removed = 0;
  finalArray.map((x: any, i: any) => {
      const isAddress = ethers.utils.isAddress(x.address);
	  if (!isAddress || x.address.length != 42) {
		  console.log(`There is an invalid address ${x.address}, ${i}`);
		  finalArray.splice(i, 1);
		  removed++;
	  }
  });
  console.log({ removed });
};

const getTotal = (amounts: any) => {
  let amount = 0;
  amounts.map((x: any) => {
    amount += Number(x.amount);
  });
  return amount;
};

const prep = () => {
  const final: any = {};
  data.map((x: any) => {
    const amount: any = final[`${x.address.toLowerCase()}`]
      ? Number(final[`${x.address.toLowerCase()}`]) + Number(x.amount)
      : Number(x.amount);
    if (!amount) {
      console.log(x.amount, x.index, final[`${x.address.toLowerCase()}`]);
    }
    final[`${x.address.toLowerCase()}`] = amount.toLocaleString("fullwide", {
      useGrouping: false,
    });
  });
  // console.log({final})
  const finalArray: any = [];
  const addresses: any = Object.keys(final);
  addresses.map((x: any) => {
    finalArray.push({ address: x, amount: final[`${x}`] });
  });
  let lengthBefore = 1
  let lengthAfter = 0
  while (lengthBefore != lengthAfter) {
    lengthBefore = finalArray.length
    console.log("length before", lengthBefore);
    validateAddress(finalArray);
    lengthAfter = finalArray.length
    console.log("length after", lengthAfter);
  }
  

  findDuplicates(finalArray);
  addIndexToLeaves(finalArray);
  // addIndexToLeaves(finalArray)
  const total = getTotal(finalArray);
  console.log({
    total: total.toLocaleString("fullwide", { useGrouping: false }),
  });
  writeFileSync(`./data.json`, JSON.stringify(finalArray));
};

prep();
