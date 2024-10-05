// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/contracts/FHE.sol";
import { console } from "forge-std/src/console.sol";
import { Math } from "./Math.sol";

contract Trade {
    using Math for eint64;

    event NewTick(string asset, int64 price);

    address public owner;
    struct TradeInfo {
        int64 price;
        int64 qty;
        int64 entry;
        int64 pl;
        uint256 timestamp;
        ebool buy;
        bool init;
    }
    mapping(string => TradeInfo) public trades;

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {  
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function getPl(string memory asset) public view returns (int32) {
        return Math.toInt(trades[asset].pl);
    }

    

    function addPrice(string memory asset, int64 price) public {
        
        TradeInfo storage trade =  trades[asset];

        emit NewTick(asset, price);

        trade.price = price;
        trade.timestamp = block.timestamp;

        
        if (trade.init == true) {
            int64 pl = (price - trade.entry)*trade.qty;
            trade.pl =  pl;
        }
    }

    function addTrade(string memory asset, int64 _qty) public {
         
        TradeInfo storage trade =  trades[asset];
   
        if (trade.timestamp == 0) {
            revert("Asset not initialized.");
        }
     
        int64 qty = _qty;

        if (trade.init == false) {
            trade.qty = qty;
            trade.init = true;
        } else {
            int64 pl = (trade.price - trade.entry) * trade.qty;
            trade.pl = trade.pl + pl;
            trade.qty = trade.qty + qty;
        }

        trade.entry = trade.price;
    }

}