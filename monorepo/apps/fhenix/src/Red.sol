// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/contracts/FHE.sol";
import { console } from "forge-std/src/console.sol";
import { FheMath } from "./FHEMath.sol";

contract Red {
    using FheMath for euint32;

    event NewTick(string asset, uint32 price);

    address public owner;
    struct TradeInfo {
        euint32 price;
        euint32 qty;
        euint32 entry;
        euint32 pl;
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
        return FheMath.toInt(trades[asset].pl);
    }

    

    function addPrice(string memory asset, uint32 price) public {
        
        TradeInfo storage trade =  trades[asset];

        emit NewTick(asset, price);

        uint32 plaintextValue = 123;
        euint32 encryptedValue = FHE.asEuint32(plaintextValue);
        //euint32 eprice = FHE.asEuint32(price);
        //trade.price = eprice;
        trade.timestamp = block.timestamp;

        
        
        if (trade.init == true) {
            //euint32 eprice = FHE.asEuint32(price);

            //euint32 epl = FheMath.mul(FheMath.sub(eprice,trade.entry),trade.qty);
            //trade.pl =  epl;

            //euint32 encryptedNewQty = trade.qty.add(eqty);
            //trade.qty = encryptedNewQty;

            //trade.entry = encryptedEntry;
        }
    }

    function addTrade(string memory asset, uint32 _qty, bool _buy) public onlyOwner {
         
        TradeInfo storage trade =  trades[asset];
   
        if (trade.timestamp == 0) {
            revert("Asset not initialized.");
        }

        ebool buy = FHE.asEbool(_buy);
        euint32 qty = FHE.asEuint32(_qty);

        ebool isBuy = buy.eq(FHE.asEbool(true));
        euint32 eqty = FHE.select(isBuy, qty, FheMath.negate(qty));

        if (trade.init == false) {
            trade.qty = eqty;
            trade.init = true;
            
        } else {
            euint32 epl = FheMath.mul(FheMath.sub(trade.price,trade.entry),trade.qty);
            trade.pl = FheMath.add(trade.pl,epl);
            trade.qty = FheMath.add(trade.qty,eqty);
        }

        trade.entry = trade.price;
    }

}