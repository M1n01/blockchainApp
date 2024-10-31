'use client';

import { useContext, useEffect, useState } from 'react';
import { Button, Card, Group, SimpleGrid, Stack, Text, TextInput, Title, Image, Badge, Modal, Center, Container, Alert } from '@mantine/core';
import { OrderWithCounter } from '@opensea/seaport-js/lib/types';
import { ethers } from 'ethers';
import { ethers as ethersV5 } from 'ethersV5';
import { IconCubePlus, IconUser } from '@tabler/icons-react';
import { Seaport } from '@opensea/seaport-js';
import { Web3SignerContext } from '@/context/web3.context';

import addresses from '../../../addresses.json';

export default function SellOrder() {
  // アプリケーション全体のステータスとしてWeb3 providerを取得、設定
  const { signer } = useContext(Web3SignerContext);

  const [sellOrder, setSellOrder] = useState<Array<OrderWithCounter>>([]);
  // 公開中売り注文の一覧取得
  const fetchSellOrders = async () => {
    const resp = await fetch('/api/order', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const datas = await resp.json();
    console.log(datas);
    setSellOrder(datas);
  };
  useEffect(() => {
    fetchSellOrders();
  }, []);

  // Seaport Contractのアドレスを入力
  const seaportAddress = addresses.seaport;

  //Seaportのインスタンスを保持するState
  const [mySeaport, setMySeaport] = useState<Seaport | null>(null);
  // Seaportのインスタンスを生成して保持
  useEffect(() => {
    // インスタンスを初期化
    const setupSeaport = async () => {
      if (signer) {
        // NOTICE: seaport-jsはethersV6をサポートしていないため、ethersV5のprovider/signerを利用
        const { ethereum } = window as any;
        const ethersV5Provider = new ethersV5.providers.Web3Provider(ethereum);
        const ethersV5Signer = ethersV5Provider.getSigner();
        // ローカルにデプロイしたSeaport Contractのアドレスを指定
        const localSeaport = new Seaport(ethersV5Signer, {
          overrides: {
            contractAddress: seaportAddress
          }
        });
        setMySeaport(localSeaport);
      }
    };
    setupSeaport();
  }, [signer]);
  // NFT購入処理
  const buyNFT = async (index: number, order: OrderWithCounter) => {
    try {
      // 売り注文に対して買い注文を作成
      const { executeAllActions: executeAllFulfillActions } = await mySeaport!.fulfillOrders({
        fulfillOrderDetails: [{ order }],
        accountAddress: await signer?.getAddress()
      });

      // 買い注文をSeaportコントラクトに発行
      const transaction = await executeAllFulfillActions();
      console.log(transaction); // For Debug
      // 売り注文の削除
      const query = new URLSearchParams({ id: index.toString() });
      fetch(`/api/order?` + query, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      // アラートメッセージを設定して終了する
      setAlert({ color: 'teal', title: 'Success buy NFT', message: 'Now you own the NFT!' });
      fetchSellOrders();
    } catch (error) {
      setAlert({ color: 'red', title: 'Failed to buy NFT', message: (error as { message: string }).message });
      console.error(error);
    }

  };

  const [alert, setAlert] = useState<{ color: string, title: string, message: string } | null>(null);

  return (
    <div>
      <Title order={1} style={{ paddingBottom: 12 }}>Sell NFT Orders</Title>
      {
        alert ?
          <Container py={8}>
            <Alert
              variant="light"
              color={alert.color}
              title={alert.title}
              withCloseButton
              onClose={() => setAlert(null)}
              icon={<IconCubePlus />}
            >
              {alert.message}
            </Alert>
          </Container> : null
      }
      <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }}>
        {
          sellOrder.map((order, index) => (
            <Card key={index} shadow='sm' padding='lg' radius='md' withBorder>
              <Card.Section>
                <Image
                  src={`https://source.unsplash.com/300x200?glass&s=${index}`}
                  height={160}
                  alt="No image"
                />
              </Card.Section>
              <Group justify='space-between' mt='md' mb='xs'>
                <Text fw={500}>{`NFT #${order.parameters.offer[0].identifierOrCriteria}`}</Text>
                <Badge color='red' variant='light'>
                  tokenId: {order.parameters.offer[0].identifierOrCriteria}
                </Badge>
              </Group>
              <Group mt='xs' mb='xs'>
                <IconUser size='2rem' stroke={1.5} />
                <Text size='md' c='dimmed'>
                  {order.parameters.consideration[0].recipient.slice(0, 6) + '...' + order.parameters.consideration[0].recipient.slice(-2)}
                </Text>
              </Group>
              <Group mt='xs' mb='xs'>
                <Text fz='lg' fw={700}>
                  {`Price: ${ethers.formatEther(BigInt(order.parameters.consideration[0].startAmount))}`}
                </Text>
                <Button
                  variant='light'
                  color='red'
                  mt='xs'
                  radius='xl'
                  style={{ flex: 1 }}
                  onClick={() => buyNFT(index, order)}
                >
                  Buy this NFT
                </Button>
              </Group>
            </Card>
          ))
        }
      </SimpleGrid>
    </div>
  );
}
