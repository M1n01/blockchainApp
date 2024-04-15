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

	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	constructor() {
		balances[msg.sender] = totalSupply;
		owner = msg.sender;
	}

	// トークンの送金
	function transfer(address to, uint256 amount) external {
		require(balances[msg.sender] >= amount, "Not enough balance");

		balances[msg.sender] -= amount;

		balances[to] += amount;

		emit Transfer(msg.sender, to, amount);
	}

	function balanceOf(address account) external view returns (uint256) {
		return balances[account];
	}
}
