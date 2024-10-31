// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// OpenZeppelinのTimelockControllerをインポート
import '@openzeppelin/contracts/governance/TimelockController.sol';
/**
 * @dev MyTimelockControllerはTimelockControllerを拡張したコントラクト
 * TimelockControllerは一定時間遅延後にトランザクションを実行可能にするスマートコントラクト
 */
contract MyTimelockController is TimelockController {
  /**
   * @dev コンストラクタでTimelockControllerを初期化
   * @param minDelay トランザクションが遅延される最小時間（秒）
   * @param proposers 提案を行えるアドレスのリスト
   * @param executors 実行を行えるアドレスのリスト
   * @param admin 管理者のアドレス
   */
  constructor(
    uint256 minDelay,
    address[] memory proposers,
    address[] memory executors,
    address admin
  ) TimelockController(minDelay, proposers, executors, admin) {}
}
