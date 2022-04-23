const data = require("./data/allProofs.json");
// const data2 = require("./data2.json");
import { writeFileSync } from 'fs';
import {ethers} from 'ethers'


const findDuplicates = (arr: any): any => {
	const onlyAddresss: any = []
	arr.map((x: any) => {
		onlyAddresss.push(x.address)
	})
	const newArr = Array.from(new Set(onlyAddresss));
	console.log(newArr.length, onlyAddresss.length)
	if (newArr.length !== onlyAddresss.length) {
		throw new Error("still duplicates")
	}
  };

  const validateAddress = (address: any) => {
	try {
	  if (address){
		ethers.utils.getAddress(address);
	  }
	} catch (e) {
	  throw new Error(
		`There is an invalid address ${address}, Here is the error message too ${e.message}`
	  );
	}
  };

  const getTotal = (amounts: any) => {
	let amount = 0
	amounts.map((x: any) => {
		amount += Number(x.amount)
	})
	return amount
  }


const prep = () => {
	const final: any = {}
	data.map((x: any) => {
		const amount =  final[`${x.leaf.address.toLowerCase()}`] ? Number(final[`${x.leaf.address.toLowerCase()}`]) + Number(x.leaf.amount) : Number(x.leaf.amount)
		final[`${x.leaf.address.toLowerCase()}`] = {amount:  amount.toLocaleString('fullwide', {useGrouping:false}), index: x.leaf.index, proof: x.proof};
	})
	// console.log({final})
	writeFileSync(`./forFrontend.json`, JSON.stringify(final));
	const finalArray: any = []
	const addresses = Object.keys(final);
	addresses.map((x: any) => {
		finalArray.push({address: x, amount: final[`${x}`]})
	})
	findDuplicates(finalArray)
	// addIndexToLeaves(finalArray)
	const total = getTotal(finalArray)
	console.log({total})
	finalArray.map((x: any) => {
		validateAddress(x.address)
	})
	console.log({ finalArray, amount: finalArray[0].amount });
	const forFrontend: any = {}
	finalArray.map((x: any) => {
		forFrontend[`${x.address}`] = {amount: x.amount.amount, index: x.amount.index, proof: x.amount.proof};
	})
	writeFileSync(`./forFrontend.json`, JSON.stringify(forFrontend));

}

prep()
