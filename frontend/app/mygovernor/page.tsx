'use client';

import { useContext, useEffect, useState } from 'react';
import { Web3SignerContext } from '@/context/web3.context';
import { Title, Button } from '@mantine/core';
import { MyGovernor, MyGovernor__factory, MyERC20, MyERC20__factory } from '@/types';
import addresses from '../../../addresses.json';

// デプロイしたMyGovernor Contractのアドレスを入力
const GovernorContractAddress = addresses.myGovernor;
// デプロイしたMyERC20 Contractのアドレスを入力
const erc20ContractAddress = addresses.myERC20;

export default function MyGovernor() {
  // アプリケーション全体のステータスとしてWeb3 providerを取得・設定
  const { signer } = useContext(Web3SignerContext);

  // MyGovernor, MyERC20のコントラクトのインスタンスを保持するState
  const [myGovernorContract, setMyGovernorContract] = useState<MyGovernor | null>(null);
  const [myERC20Contract, setMyERC20Contract] = useState<MyERC20 | null>(null);

  // 自身のアドレスが委任済みかどうかを保持するState
  const [isDelegated, setIsDelegated] = useState(false);

  // MyGovernorとMyERC20のコントラクトのインスタンスを生成
  useEffect(() => {
    if (signer) {
      const governorContract = MyGovernor__factory.connect(GovernorContractAddress, signer);
      setMyGovernorContract(governorContract);
      const erc20Contract = MyERC20__factory.connect(erc20ContractAddress, signer);
      setMyERC20Contract(erc20Contract);
    }
  }, [signer]);

  // 自身のアドレスを委任する処理
  const handleDelegate = async () => {
    if (myERC20Contract && signer) {
      await myERC20Contract.delegate(await signer.getAddress());
      setIsDelegated(true);
    }
  };

  return (
    <div>
      <Title order={1} style={{ paddingBottom: 12 }}>
        My Governor Management
      </Title>
      {!isDelegated && <Button onClick={handleDelegate}>Delegate</Button>}
    </div>
  );
}
