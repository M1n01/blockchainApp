// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// OPEN ZEPPELINのERC20をimport
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
// オーナー権限を管理するコントラクトを追加
import '@openzeppelin/contracts/access/Ownable.sol';
// 投票に必要な拡張コントラクトを追加
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';
// アクセス制御するコントラクトを追加
import '@openzeppelin/contracts/access/AccessControl.sol';

// インポートしたERC20を継承してMyERC20を作成
contract MyERC20 is ERC20, Ownable, ERC20Permit, ERC20Votes, AccessControl {
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  // トークンの名前と単位を渡す
  constructor() ERC20('MyERC20', 'ME2') ERC20Permit('MyERC20') {
    // トークンを作成者に1000000発行
    _mint(msg.sender, 1000000);
    Ownable(msg.sender);
    _grantRole(MINTER_ROLE, msg.sender);
  }

  /**
   * @dev トークンを発行(mint)
   * この関数はMINTER_ROLEを持つアドレスのみが実行できる
   * @param to トークンを受け取るアドレス
   * @param amount 発行するトークンの量
   */
  function mint(address to, uint256 amount) public {
    require(hasRole(MINTER_ROLE, msg.sender), 'Caller is not a minter');
    _mint(to, amount);
  }

  /**
   * @dev トークンを発行する(mint)内部関数
   * ERC20とERC20Votesの両方で同じ関数が定義されているため、
   * 継承したコントラクトでオーバーライドする必要がある
   * @param to トークンを受け取るアドレス
   * @param amount 発行するトークンの量
   */
  function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._mint(to, amount);
  }

  /**
   * @dev トークンの転送後に呼び出される内部関数
   * ERC20とERC20Votesの両方で同じ関数が定義されているため、
   * 継承したコントラクトでオーバーライドする必要がある
   * @param from トークンを送信したアドレス
   * @param to トークンを受け取ったアドレス
   * @param amount 転送するトークンの量
   */
  function _afterTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC20, ERC20Votes) {
    super._afterTokenTransfer(from, to, amount);
  }

  /**
   * @dev トークンを破壊する(burn)内部関数
   * ERC20とERC20Votesの両方で同じ関数が定義されているため、
   * 継承したコントラクトでオーバーライドする必要がある
   * @param account トークンを破壊する所有者アドレス
   * @param amount 破壊するトークンの量
   */
  function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._burn(account, amount);
  }

  /**
   * @dev MINTER_ROLEを新たなアドレスに付与
   * この関数はオーナーのみが実行できる
   * @param minterAddress MINTER_ROLEを付与するアドレス
   */
  function grantMinterRole(address minterAddress) public onlyOwner {
    _grantRole(MINTER_ROLE, minterAddress);
  }

  /**
   * @dev タイムスタンプベースのチェックポイント（および投票）を実装するための時計を返す
   * ERC6372ベースで、ブロックベースではなくタイムスタンプベースのGovernorに使用される
   * Hardhatでのテストネットワークではテストできないため、利用しない
   * @return 現在のタイムスタンプ（秒 ）
   */
  // function clock() public view override returns (uint48) {
  //     return uint48(block.timestamp);
  // }

  /**
   * @dev このGovernorがタイムスタンプベースで動作することを示すモード情報を返す
   * ERC6372ベースで、ブロックベースではなくタイムスタンプベースのGovernorに使用される
   * Hardhatでのテストネットワークではテストできないため、利用しない
   * @return タイムスタンプベースのモードを示す文字列
   */
  // function CLOCK_MODE() public pure override returns (string memory) {
  //     return "mode=timestamp";
  // }
}
