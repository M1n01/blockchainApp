import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyToken contract", function () {
  it("トークンの全供給量を所有者に割り当てる", async function () {
    const [owner] = await ethers.getSigners();

    const MyToken = await ethers.deployContract("MyToken");

    const ownerBalance = await MyToken.balanceOf(owner.address);

    expect(await MyToken.totalSupply()).to.equal(ownerBalance);
  });
});
