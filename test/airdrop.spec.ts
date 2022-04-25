import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { increaseTime } from "../utils/utils";
const rootHash = require("../merkle/data/rootHash.json");
// const allProofs: any[] = sortAndAddIndex(require("../merkle/data.json"));
const allProofs = require("../merkle/data/allProofs.json");

describe("Airdrop", function () {
  let alice, treasury: any;
  let airdrop: Contract;
  let airdropToken: Contract;

  const totalTokens = ethers.BigNumber.from("8565800999997343000000000")
  // //allProofs.reduce(
  //   (previousValue: any, currentValue: any) => {
  //     return previousValue.add(ethers.BigNumber.from(currentValue.amount));
  //   },
  //   ethers.BigNumber.from("0")
  // );
  const sampleSize = 10
  const random = Math.floor(Math.random() * allProofs.length) + 1   
  let loop = random + sampleSize >= allProofs.length ? random - sampleSize : random
  const end = random + sampleSize >= allProofs.length ? random  : random + sampleSize
  // let reduce = ethers.BigNumber.from("0")
  // reduce = allProofs.map(x => reduce.add(ethers.BigNumber.from(x.leaf.amount)))

  // const reduce = allProofs.reduce((acc, red) => {return acc + Number(red.leaf.amount)}, 0)
  // const endAmount = totalTokens.sub(reduce)//totalTokens.sub(ethers.BigNumber.from(allProofs[0].leaf.amount).mul(ethers.BigNumber.from(sampleSize)))
  beforeEach(async function () {
    [alice, treasury] = await ethers.getSigners();

    // Mock Token
    const AirdropToken = await ethers.getContractFactory("AirdropToken");
    airdropToken = await AirdropToken.deploy("Testing Token", "TEST");
    await airdropToken.deployed();

    // Airdrop contract
    const Airdrop = await ethers.getContractFactory("Airdrop");
    airdrop = await Airdrop.deploy(
      airdropToken.address,
      rootHash,
      treasury.address
    );
    await airdrop.deployed();
  });

  it("should record constructor arguments", async () => {
    expect(await airdrop._rootHash()).to.equal(rootHash);
    expect(await airdrop._token()).to.equal(airdropToken.address);
  });

  it("should fail if no tokens available", async () => {
    await expect(
      airdrop.redeemPackage(
        allProofs[0].leaf.index,
        allProofs[0].leaf.address,
        allProofs[0].leaf.amount,
        allProofs[0].proof
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  describe("After sending tokens", async () => {
    beforeEach(async () => {
      await airdropToken.mint(airdrop.address, totalTokens);
      expect(await airdropToken.balanceOf(airdrop.address)).to.equal(
        totalTokens
      );
    });

    it("should succeed if proof is correct", async () => {
      await airdrop.redeemPackage(
        allProofs[0].leaf.index,
        allProofs[0].leaf.address,
        allProofs[0].leaf.amount,
        allProofs[0].proof
      );

      expect(await airdropToken.balanceOf(allProofs[0].leaf.address)).to.equal(
        allProofs[0].leaf.amount
      );
    });

    it("should fail to redeem twice", async () => {
      await airdrop.redeemPackage(
        allProofs[0].leaf.index,
        allProofs[0].leaf.address,
        allProofs[0].leaf.amount,
        allProofs[0].proof
      );

      expect(await airdropToken.balanceOf(allProofs[0].leaf.address)).to.equal(
        allProofs[0].leaf.amount
      );

      await expect(
        airdrop.redeemPackage(
          allProofs[0].leaf.index,
          allProofs[0].leaf.address,
          allProofs[0].leaf.amount,
          allProofs[0].proof
        )
      ).to.be.revertedWith("Airdrop: already redeemed");
    });

    it("should fail if wrong amount", async () => {
      await expect(
        airdrop.redeemPackage(
          allProofs[0].leaf.index,
          allProofs[0].leaf.address,
          allProofs[0].leaf.amount + "1",
          allProofs[0].proof
        )
      ).to.be.revertedWith("Airdrop: Merkle root mismatch");

      await airdrop.redeemPackage(
        allProofs[0].leaf.index,
        allProofs[0].leaf.address,
        allProofs[0].leaf.amount,
        allProofs[0].proof
      );

      expect(await airdropToken.balanceOf(allProofs[0].leaf.address)).to.equal(
        allProofs[0].leaf.amount
      );
    });

    it("should fail if wrong address", async () => {
      await expect(
        airdrop.redeemPackage(
          allProofs[0].leaf.index,
          ethers.constants.AddressZero,
          allProofs[0].leaf.amount,
          allProofs[0].proof
        )
      ).to.be.revertedWith("Airdrop: Merkle root mismatch");

      await airdrop.redeemPackage(
        allProofs[0].leaf.index,
        allProofs[0].leaf.address,
        allProofs[0].leaf.amount,
        allProofs[0].proof
      );

      expect(await airdropToken.balanceOf(allProofs[0].leaf.address)).to.equal(
        allProofs[0].leaf.amount
      );
    });

    it("should succeed for every record in the data file", async () => {
      //for (let index = 0; index < end; index += 1) {
      for (let index=0; index < allProofs.length; index += 1) {
        await airdrop.redeemPackage(
          allProofs[index].leaf.index,
          allProofs[index].leaf.address,
          allProofs[index].leaf.amount,
          allProofs[index].proof
        );

        expect(await airdropToken.balanceOf(allProofs[index].leaf.address)).to.equal(
          allProofs[index].leaf.amount
        );
      }
      // expect(await airdropToken.balanceOf(airdrop.address)).to.equal(endAmount);
    });

    it("should prevent every record from double redeeming", async () => {
      //for (let index = loop; index < end; index += 1) {
        for (let index=0; index < allProofs.length; index += 1) {

        // First succeeds.
        await airdrop.redeemPackage(
          allProofs[index].leaf.index,
          allProofs[index].leaf.address,
          allProofs[index].leaf.amount,
          allProofs[index].proof
        );

        expect(await airdropToken.balanceOf(allProofs[index].leaf.address)).to.equal(
          allProofs[index].leaf.amount
        );

        // Immediate second attempt must fail.
        await expect(
          airdrop.redeemPackage(
            allProofs[index].leaf.index,
            allProofs[index].leaf.address,
            allProofs[index].leaf.amount,
            allProofs[index].proof
          )
        ).to.be.revertedWith("Airdrop: already redeemed");
      }

      //for (let index = loop; index < end; index += 1) {
          for (let index=0; index < allProofs.length; index += 1) {    
      // Later second attempt must fail.
        await expect(
          airdrop.redeemPackage(
            allProofs[index].leaf.index,
            allProofs[index].leaf.address,
            allProofs[index].leaf.amount,
            allProofs[index].proof
          )
        ).to.be.revertedWith("Airdrop: already redeemed");
      }

      // expect(await airdropToken.balanceOf(airdrop.address)).to.equal(endAmount);
    });

  
    it("should fail past deadline the reclaim leftover tokens", async () => {
      await expect(
        airdrop.sweepPostDeadline(airdropToken.address)
      ).to.be.revertedWith("Airdrop: Deadline has not yet passed.");

      await increaseTime(ethers, 3728800);

      await expect(
        airdrop.redeemPackage(
          allProofs[0].leaf.index,
          allProofs[0].leaf.address,
          allProofs[0].leaf.amount,
          allProofs[0].proof
        )
      ).to.be.revertedWith("revert Airdrop: Redemption deadline passed.");

      const balance = await airdropToken.balanceOf(airdrop.address);

      await airdrop.sweepPostDeadline(airdropToken.address);

      expect(await airdropToken.balanceOf(treasury.address)).to.equal(balance);
    });
  });
});
