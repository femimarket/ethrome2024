// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/contracts/FHE.sol";
import { console } from "forge-std/src/console.sol";
import { Math } from "./Math.sol";

contract Trade {

    event NewTick(string asset, euint32 price);

    address public owner;
    struct TradeInfo {
        euint32 price;
        euint32 qty;
        euint32 entry;
        euint32 p;
        euint32 l;
        euint32 tp;
        euint32 tl;
        uint256 timestamp;
        ebool buy;
    }
    mapping(string => TradeInfo) public trades;

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {  
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function getPl(string memory asset) public view returns (euint32,euint32) {
        return (trades[asset].p, trades[asset].l);
    }

    

    function addPrice(string memory asset, inEuint32 memory price) public {
        
        TradeInfo storage trade =  trades[asset];

        emit NewTick(asset, FHE.asEuint32(price));

        trade.price = FHE.asEuint32(price);
        trade.timestamp = block.timestamp;


        euint32 min = FHE.min(trade.entry, trade.price);   
        euint32 max = FHE.max(trade.entry, trade.price);   
        euint32 diff = max - min;
        euint32 pl = diff * trade.qty;

        euint8 win1 = FHE.select(FHE.lt(trade.price, trade.entry), FHE.asEuint8(1), FHE.asEuint8(0));
        euint8 win2 = FHE.select(trade.buy.eq(FHE.asEbool(false)), FHE.asEuint8(1),  FHE.asEuint8(0));
        euint8 win3 = FHE.select(FHE.gt(trade.price, trade.entry), FHE.asEuint8(1),  FHE.asEuint8(0));
        euint8 win4 = FHE.select(FHE.eq(trade.buy,FHE.asEbool(true)), FHE.asEuint8(1),  FHE.asEuint8(0));
        euint8 win = win1 + win2 + win3 + win4;
        trade.tp = trade.p + FHE.select(win.eq(FHE.asEuint8(1)), pl, trade.tp);
        trade.tl = trade.l + FHE.select(win.eq(FHE.asEuint8(0)), pl, trade.tl);
    }


    function enterTrade(string memory asset, inEuint32 calldata _qty, ebool _buy) public {
        TradeInfo storage trade =  trades[asset];
   
        // if (trade.timestamp == 0) {
        //     revert("Asset not initialized.");
        // }
     
        euint32 qty = FHE.asEuint32(_qty);
        //trade.qty = qty;
        //trade.buy = _buy;
        //trade.entry = trade.price;
    }


    function exitTrade(string memory asset) public {
        TradeInfo storage trade =  trades[asset];
   

        euint32 min = FHE.min(trade.entry, trade.price);   
        euint32 max = FHE.max(trade.entry, trade.price);   
        euint32 diff = max - min;
        euint32 pl = diff * trade.qty;


        euint8 win1 = FHE.select(FHE.lt(trade.price, trade.entry), FHE.asEuint8(1), FHE.asEuint8(0));
        euint8 win2 = FHE.select(FHE.eq(trade.buy,FHE.asEbool(false)), FHE.asEuint8(1),  FHE.asEuint8(0));
        euint8 win3 = FHE.select(FHE.gt(trade.price, trade.entry), FHE.asEuint8(1),  FHE.asEuint8(0));
        euint8 win4 = FHE.select(FHE.eq(trade.buy,FHE.asEbool(true)), FHE.asEuint8(1),  FHE.asEuint8(0));
        euint8 win = win1 + win2 + win3 + win4;


        trade.p = trade.p + FHE.select(win.eq(FHE.asEuint8(1)), pl, trade.p);
        trade.l = trade.l + FHE.select(win.eq(FHE.asEuint8(0)), pl, trade.l);
        trade.qty = FHE.asEuint32(0);
        trade.entry = FHE.asEuint32(0);
    }

}