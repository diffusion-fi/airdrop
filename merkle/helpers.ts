import { writeFileSync } from 'fs';
import {ethers} from 'ethers'

const hotAdd = (leaves: any) => {
	console.log(leaves)
	leaves.map((x: any, i: any) => {
		x.index = i
	})
	console.log(leaves.length)
	writeFileSync(`./data.json`, leaves);
	return leaves
}	

const formatEthers = (leaves: any) => {
	console.log(leaves)
	leaves.map((x: any) => {
		x.amount = x.amount + "000000000000000000"
	})
	writeFileSync(`./data.json`, JSON.stringify(leaves));
	return leaves
}

export const addIndexToLeaves = (leaves: any) => {
	leaves.map((x: any, i: any) => {
		x.index = i
	})
	return leaves
}	


export const writeToFileSystem = (data: any, path: any) => {
	writeFileSync(`./merkle/data/${path}.json`, data);
	console.log(`info written to data/${path}.json`)
}
