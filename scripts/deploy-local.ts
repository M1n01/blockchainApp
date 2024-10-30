import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const myToken = await ethers.deployContract("MyToken");
  myToken.waitForDeployment();
  console.log(`MyToken deployed to: ${myToken.target}`);

  const myERC20 = await ethers.deployContract("MyERC20");
  await myERC20.waitForDeployment();
  console.log(`MyERC20 deployed to: ${myERC20.target}`);

  //NFT Contractをデプロイする
  const myERC721 = await ethers.deployContract("MyERC721", ["MyERC721", "MYERC721"]);
  await myERC721.waitForDeployment();
  console.log(`MyERC721 deployed to: ${myERC721.target}`);

  const addresses = {
    myToken: await myToken.getAddress(),
    myERC20: await myERC20.getAddress(),
    myERC721: await myERC721.getAddress(),
  };

  fs.writeFileSync("addresses.json", JSON.stringify(addresses, null, 2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
