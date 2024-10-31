# Web3開発入門(Solidity)

## 目次

- [Web3開発入門(Solidity)](#web3開発入門solidity)
	- [目次](#目次)
	- [参考](#参考)
	- [使用技術について](#使用技術について)
		- [フロントエンド](#フロントエンド)
	- [環境構築](#環境構築)
		- [Visual Studio Code 拡張機能](#visual-studio-code-拡張機能)
		- [クローン](#クローン)
	- [立ち上げ](#立ち上げ)

## 参考
- 書籍: [エンジニアのためのWeb3開発入門](https://www.amazon.co.jp/%E3%82%A8%E3%83%B3%E3%82%B8%E3%83%8B%E3%82%A2%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AEWeb3%E9%96%8B%E7%99%BA%E5%85%A5%E9%96%80-%E3%82%A4%E3%83%BC%E3%82%B5%E3%83%AA%E3%82%A2%E3%83%A0%E3%83%BBNFT%E3%83%BBDAO%E3%81%AB%E3%82%88%E3%82%8B%E3%83%96%E3%83%AD%E3%83%83%E3%82%AF%E3%83%81%E3%82%A7%E3%83%BC%E3%83%B3Web%E3%82%A2%E3%83%97%E3%83%AA%E9%96%8B%E7%99%BA-%E6%84%9B%E6%95%AC-%E7%9C%9F%E7%94%9F/dp/4295018635)

## 使用技術について

### フロントエンド
- Next.js
- TypeScript
- Solidity
- Mantine

<p align="right">(<a href="#top">トップへ</a>)</p>

## 環境構築
### Visual Studio Code 拡張機能

- Prettier
- Solidity

### クローン

```
$ git clone https://github.com/M1n01/blockchainApp.git
```

```bash
npm install
npx hardhat compile
```

<p align="right">(<a href="#top">トップへ</a>)</p>

## 立ち上げ

```
npx hardhat node

// 別ターミナルで
npm run deploy
npm run dev

// ブラウザで http://localhost:3000 にアクセス
```
