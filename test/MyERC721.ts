import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('MyERC721', function () {
  async function deployFixture() {
    const [owner, account1] = await ethers.getSigners();
    const MyERC721Factory = await ethers.getContractFactory('MyERC721');
    const MyERC721 = await MyERC721Factory.deploy('TestNFT', 'MYNFT');
    return { MyERC721, owner, account1 };
  }

  describe("初期流通量とNFT作成のテスト", function () {
    it("初期流通量は0", async function () {
      const { MyERC721 } = await loadFixture(deployFixture);
      expect(await MyERC721.totalSupply()).to.equal(0);
    });
    // MyERC721を作成するテスト
    it("MyERC721を作成するテスト", async function () {
      const { MyERC721, account1 } = await loadFixture(deployFixture);
      // NOTE: Contractに関して特に明示的なconnectメソッドの呼び出しがなければ、ownerアカウントによるTx発行となる
      await MyERC721.safeMint(account1.address, 'https://example.com/nft1.json');
      // account1が所有するNFTが1つ増えていることを確認
      expect(await MyERC721.balanceOf(account1.address)).to.equal(1);
      // NFTコントラクト全体でも1つ増えていることを確認
      expect(await MyERC721.totalSupply()).to.equal(1);
    });
    // account1からは作成ができないことの確認
    it("account1からはNFTを作成できないことの確認", async function() {
      const { MyERC721, account1 } = await loadFixture(deployFixture);
      // hardhat-chai-matcherの機能を使ってTxが意図したエラーでRevertされることを確認
      await expect(
        MyERC721.connect(account1).safeMint(account1.address, 'https://example.com/nft1.json')
        ).to.be.revertedWith(/AccessControl: account .* is missing role .*/);
    });
  });
  // MyERC721をtransferするテスト
  describe("MyERC721をtransferするテスト", function() {
    it("MyERC721をtransferするテスト", async function() {
      const { MyERC721, owner, account1 } = await loadFixture(deployFixture);
      // account1を保有者とするNFTを作成する
      const txResp = await MyERC721.safeMint(account1.address, 'https://example.com/nft1.json');
      // TransferイベントからtokenIdを特定する
      const logs = await MyERC721.queryFilter(MyERC721.filters.Transfer());
      const tokenId = logs.find( log => log.transactionHash == txResp.hash)!.args[2];
      // account1からownerにNFTをtransferする
      await MyERC721.connect(account1).transferFrom(account1.address, owner.address, tokenId);
      // NFT保有者がownerに変更されることの確認
      expect(await MyERC721.ownerOf(tokenId)).to.equal(owner.address);
    });
    it("account1からowner保有のNFTはtransferができないことの確認", async function() {
      const { MyERC721, owner, account1 } = await loadFixture(deployFixture);
      // ownerを保有者とするNFTを作成する
      const txResp = await MyERC721.safeMint(owner.address, 'https://example.com/nft1.json');
      // TransferイベントからtokenIdを特定する
      const logs = await MyERC721.queryFilter(MyERC721.filters.Transfer());
      const tokenId = logs.find( log => log.transactionHash == txResp.hash)!.args[2];
      // hardhat-chai-matcherの機能を使ってTxが意図したエラーでRevertされることを確認
      await expect(
        MyERC721.connect(account1).transferFrom(owner.address, account1.address, tokenId)
        ).to.be.revertedWith('ERC721: caller is not token owner or approved');
    });
    it("NFT保有者がapproveすればaccount1からもNFTをtransferできることの確認", async function() {
      const { MyERC721, owner, account1 } = await loadFixture(deployFixture);
      // ownerを保有者とするNFTを作成する
      const txResp = await MyERC721.safeMint(owner.address, 'https://example.com/nft1.json');
      // TransferイベントからtokenIdを特定する
      const logs = await MyERC721.queryFilter(MyERC721.filters.Transfer());
      const tokenId = logs.find( log => log.transactionHash == txResp.hash)!.args[2];
      // ownerが保有するすべてのNFTについて、account1による操作をapproveする
      await MyERC721.connect(owner).setApprovalForAll(account1.address, true);
      // approveされたaccount1が、ownerのNFTをtransferする
      await MyERC721.connect(account1).transferFrom(owner.address, account1.address, tokenId);
      // NFTの保有者がaccount1に変更されていることの確認
      expect(await MyERC721.ownerOf(tokenId)).to.equal(account1.address);
    });
  });

});

