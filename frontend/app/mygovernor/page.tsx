'use client';
import { ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { Web3SignerContext } from '@/context/web3.context';
import {
  Alert,
  Avatar,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Badge,
  Title,
  Button,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { MyGovernor, MyERC20 } from '@/types';
import { MyGovernor__factory, MyERC20__factory } from '@/types';
import addresses from '../../../addresses.json';

// デプロイしたMyGovernor Contractのアドレスを入力
const GovernorContractAddress = addresses.myGovernor;
// デプロイしたMyERC20 Contractのアドレスを入力
const erc20ContractAddress = addresses.myERC20;

// ProposalのステータスをEnum形式で定義
enum ProposalStatus {
  Pending = 0,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
  Unknown,
}

// Proposalの情報を定義
type Proposal = {
  topic: string;
  status: number;
  proposalId: string;
  description: string;
  targets: string[];
  values: bigint[];
  calldatas: string[];
};

const getStatusString = (status: number) => ProposalStatus[status] || 'Unknown';

export default function MyGovernor() {
  // アプリケーション全体のステータスとしてWeb3 providerを取得・設定
  const { signer } = useContext(Web3SignerContext);

  // MyGovernor, MyERC20のコントラクトのインスタンスを保持するState
  const [myGovernorContract, setMyGovernorContract] = useState<MyGovernor | null>(null);
  const [myERC20Contract, setMyERC20Contract] = useState<MyERC20 | null>(null);

  // 自身のアドレスが委任済みかどうかを保持するState
  const [isDelegated, setIsDelegated] = useState(false);

  // Alert, Loading state
  const [showAlert, setShowAlert] = useState(false); // アラートの表示管理
  const [alertMessage, setAlertMessage] = useState(''); // アラートのメッセージ管理
  const [loading, setLoading] = useState(false); // ローディングの表示管理

  // 提案一覧を管理するState(リロードすると表示から消えてしまうため、サンプルアプリケーションとしてのみ利用可能 )
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [proposalTopic, setProposalTopic] = useState('');

  // MyGovernorとMyERC20のコントラクトのインスタンスを生成
  useEffect(() => {
    if (signer) {
      const governorContract = MyGovernor__factory.connect(GovernorContractAddress, signer);
      setMyGovernorContract(governorContract);
      const erc20Contract = MyERC20__factory.connect(erc20ContractAddress, signer);
      setMyERC20Contract(erc20Contract);
    }
  }, [signer]);

  // 自身のアドレスが委任済みかどうかを判定
  useEffect(() => {
    const checkDelegation = async () => {
      if (myERC20Contract && signer) {
        const delegatedAddress = await myERC20Contract.delegates(await signer.getAddress());
        setIsDelegated(delegatedAddress === (await signer.getAddress()));
      }
    };
    checkDelegation();
  }, [myGovernorContract, signer]);

  // 自身のアドレスを委任する処理
  const handleDelegate = async () => {
    if (myERC20Contract && signer) {
      await myERC20Contract.delegate(await signer.getAddress());
      setIsDelegated(true);
    }
  };

  const createProposal = async () => {
    setLoading(true);

    try {
      const myERC20Interface = MyERC20__factory.createInterface();
      const calldata = myERC20Interface.encodeFunctionData('mint', [
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        BigInt(1000000),
      ]);
      const target = erc20ContractAddress;
      const value = BigInt('0');

      if (myGovernorContract) {
        const tx = await myGovernorContract.propose([target], [value], [calldata], proposalTopic);

        if (tx) {
          const receipt = await tx.wait();
          if (receipt && receipt.logs && receipt.logs.length > 0) {
            // transaction logから、ProposalCreatedのイベントを抽出して、ProposalIdを取得
            const proposalId = await myGovernorContract.hashProposal(
              [target],
              [value],
              [calldata],
              proposalTopic
            );
            console.log(proposalId);

            // proposalIdを取得できたら、Proposals一覧に追加する
            if (proposalId) {
              setMyProposals((prevProposals) => [
                ...prevProposals,
                {
                  topic: proposalTopic,
                  status: ProposalStatus.Pending,
                  proposalId: proposalId.toString(),
                  description: proposalTopic,
                  targets: [target],
                  values: [value],
                  calldatas: [calldata],
                },
              ]);
              setShowAlert(true);
              setAlertMessage('Proposal created successfully');
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title order={1} style={{ paddingBottom: 12 }}>
        My Governor Management
      </Title>
      {!isDelegated && <Button onClick={handleDelegate}>Delegate</Button>}
      {showAlert && (
        <Container py={8}>
          <Alert
            variant="light"
            color="teal"
            title="Proposal created successfully"
            withCloseButton
            onClose={() => setShowAlert(false)}
            icon={<IconPlus />}
          >
            {alertMessage}
          </Alert>
        </Container>
      )}
      <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }}>
        <CreateProposalForm
          proposalTopic={proposalTopic}
          onProposalTopicChange={setProposalTopic}
          onCreateProposal={createProposal}
          loading={loading}
        />
        {myGovernorContract &&
          myProposals.map((proposal, index) => (
            <ProposalCard key={index} proposal={proposal} myGovernorContract={myGovernorContract} />
          ))}
      </SimpleGrid>
    </div>
  );
}

function CreateProposalForm({
  proposalTopic,
  onProposalTopicChange,
  onCreateProposal,
  loading,
}: {
  proposalTopic: string;
  onProposalTopicChange: (topic: string) => void;
  onCreateProposal: () => void;
  loading: boolean;
}) {
  return (
    <Card key={-1} shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Container py={12}>
          <Group justify="center">
            <Avatar color="blue" radius="xl">
              <IconPlus size="1.5rem" />
            </Avatar>
            <Text fw={700}>Create Your Proposal!</Text>
          </Group>
        </Container>
      </Card.Section>
      <Stack>
        <TextInput
          label="Proposal Topic"
          placeholder="Enter your proposal topic..."
          value={proposalTopic}
          onChange={(e) => onProposalTopicChange(e.target.value)}
        />
        <Button onClick={onCreateProposal} loading={loading}>
          Create Proposal
        </Button>
      </Stack>
    </Card>
  );
}

function ProposalCard({
  proposal,
  myGovernorContract,
}: {
  proposal: Proposal;
  myGovernorContract: MyGovernor;
}) {
  const [proposalStatus, setProposalStatus] = useState(proposal.status);
  const [votesStatus, setVotesStatus] = useState(proposal.status);
  const [alertMessage, setAlertMessage] = useState('');

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Container py={12}>
          <Text fw={700} style={{ textAlign: 'center' }}>
            {proposal.topic}
          </Text>
        </Container>
      </Card.Section>
      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{getStatusString(proposalStatus)}</Text>

        <Badge color="blue" variant="light">
          proposalId: {proposal.proposalId.toString()}
        </Badge>
      </Group>
      <Text size="sm" c="dimmed">
        {proposal.description}
      </Text>

      {alertMessage && (
        <Container py={8}>
          <Alert
            variant="light"
            color={alertMessage.includes('失敗') ? 'red' : 'teal'}
            title={alertMessage}
            withCloseButton
            onClose={() => setAlertMessage('')}
          >
            {alertMessage}
          </Alert>
        </Container>
      )}
    </Card>
  );
}
