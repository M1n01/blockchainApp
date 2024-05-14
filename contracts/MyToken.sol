// SPDX-License-Identifier: UNLICENSED
// Solidityのバージョンを指定
pragma solidity ^0.8.0;

contract MyToken {
	// トークンの名前
	string public name = "My Token";
	// トークンの単位
	string public symbol = "MYT";

	// トークンの総供給量
	uint256 public totalSupply = 1000000;

	// このトークンのオーナーを定義
	address public owner;

	// トークンの所有者のアドレスと所有量を管理
	mapping (address => uint256) balances;

	// event定義
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	constructor() {
		// コンストラクト作成者に最大供給量のトークンを設定
		balances[msg.sender] = totalSupply;
		// オーナーをコントラクト作成者に設定
		owner = msg.sender;
	}

	// トークンを転送する関数
	function transfer(address to, uint256 amount) external {
		// この関数を実行したアドレスの残高に指定したトークン量があるか確認
		require(balances[msg.sender] >= amount, "Not enough balance");

		// この関数を実行したアドレスの残高から指定したトークン量を引く
		balances[msg.sender] -= amount;

		// 指定したアドレスの残高に指定したトークン量を加える
		balances[to] += amount;

		// eventを発火
		emit Transfer(msg.sender, to, amount);
	}

	// 残高を取得する関数
	function balanceOf(address account) external view returns (uint256) {
		return balances[account];
	}
}
