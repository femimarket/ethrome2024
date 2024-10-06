// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13 <0.9.0;

import "@fhenixprotocol/contracts/FHE.sol";

contract Trade {

    event NewTick(string asset, uint32 price);

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
        ebool isTrading;
    }
    mapping(string => TradeInfo) public trades;

    constructor(address _owner) {
        owner = _owner;
    }

    modifier onlyOwner() {  
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function getPl(string memory asset) public view returns (uint32,uint32) {
        TradeInfo storage trade = trades[asset];
        return (FHE.decrypt(trade.p), FHE.decrypt(trade.l));
    }

    function getTpl(string memory asset) public view returns (uint32,uint32) {
        TradeInfo storage trade = trades[asset];
        return (FHE.decrypt(trade.tp), FHE.decrypt(trade.tl));
    }

    function isTrading(string memory asset) public view returns (bool) {
        TradeInfo storage trade = trades[asset];
        return FHE.decrypt(trade.isTrading);
    }

    

    function addPrice(string memory asset, inEuint32 memory price) public {
        
        TradeInfo storage trade =  trades[asset];

        emit NewTick(asset, FHE.decrypt(FHE.asEuint32(price)));

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

        trade.tp = FHE.select(win.gt(FHE.asEuint8(0)), pl, FHE.asEuint32(0));
        trade.tl = FHE.select(win.lte(FHE.asEuint8(0)), pl, FHE.asEuint32(0));
    }


    function enterTrade(string memory asset, inEuint32 calldata _qty, inEbool calldata _buy) public {
        TradeInfo storage trade =  trades[asset];
   
        trade.qty = FHE.asEuint32(_qty);
        trade.buy = FHE.asEbool(_buy);
        euint32 newEntry = trade.price * FHE.asEuint32(0);
        trade.entry = newEntry + trade.price;
        trade.isTrading = FHE.asEbool(true);
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

        trade.p = trade.p + FHE.select(win.gt(FHE.asEuint8(0)), pl, FHE.asEuint32(0));
        trade.l = trade.l + FHE.select(win.lte(FHE.asEuint8(0)), pl, FHE.asEuint32(0));
        trade.qty = FHE.asEuint32(0);
        trade.entry = FHE.asEuint32(0);
        trade.isTrading = FHE.asEbool(false);
    }

}