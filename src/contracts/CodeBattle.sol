// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CodeBattle {
    address public owner;
    uint256 public entryFee;
    address public player1;
    address public player2;
    address public winner;
    bool public battleStarted;
    
    mapping(address => uint256) public balances;
    
    constructor(uint256 _entryFee) {
        owner = msg.sender;
        entryFee = _entryFee;
    }

    // Players join the battle by paying the entry fee
    function joinBattle() public payable {
        require(msg.value == entryFee, "Incorrect entry fee");
        require(player1 == address(0) || player2 == address(0), "Battle is full");

        if (player1 == address(0)) {
            player1 = msg.sender;
        } else {
            player2 = msg.sender;
            battleStarted = true;
        }
    }

    // The backend determines the winner and calls this function
    function declareWinner(address _winner) public {
        require(battleStarted, "Battle not started");
        require(msg.sender == owner, "Only the owner can declare the winner");
        require(_winner == player1 || _winner == player2, "Invalid winner");

        winner = _winner;
        payable(winner).transfer(address(this).balance);
        
        // Reset battle
        player1 = address(0);
        player2 = address(0);
        winner = address(0);
        battleStarted = false;
    }
    
    // Withdraw function in case of issues
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
}
