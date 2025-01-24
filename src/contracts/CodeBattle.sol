// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CodeBattle {
    address public owner;
    uint256 public entryFee;
    
    struct Battle {
        address player;
        uint256 amount;
        bool completed;
    }
    
    mapping(bytes32 => Battle) public battles;
    
    event BattleCreated(bytes32 battleId, address player, uint256 amount);
    event BattleCompleted(bytes32 battleId, address player, uint256 amount);
    
    constructor(uint256 _entryFee) {
        owner = msg.sender;
        entryFee = _entryFee;
    }
    
    function createBattle() external payable returns (bytes32) {
        require(msg.value == entryFee, "Incorrect entry fee");
        
        bytes32 battleId = keccak256(abi.encodePacked(msg.sender, block.timestamp));
        battles[battleId] = Battle(msg.sender, msg.value, false);
        
        emit BattleCreated(battleId, msg.sender, msg.value);
        return battleId;
    }
    
    function completeBattle(bytes32 battleId, bool success) external {
        require(msg.sender == owner, "Only owner can complete battles");
        Battle storage battle = battles[battleId];
        require(!battle.completed, "Battle already completed");
        
        battle.completed = true;
        
        if (success) {
            payable(battle.player).transfer(battle.amount * 2);
        }
        
        emit BattleCompleted(battleId, battle.player, battle.amount);
    }
}