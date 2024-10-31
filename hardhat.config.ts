import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.8.17",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000
          }
        }
      }
    ]
  },
  typechain: {
    outDir: "frontend/types",
    target: "ethers-v6",
    alwaysGenerateOverloads: false, // コントラクトにおける関数のオーバーロードがない場合でも、"deposit(uint256)"のよう完全なシグネチャを生成するか
    // externalArtifacts: ["externalArtifacts/*.json"], // Typeファイルの生成に追加したい外部のartifactsがある場合は指定する
  }
};

export default config;
