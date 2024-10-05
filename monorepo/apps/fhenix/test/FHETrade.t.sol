// SPDX-License-Identifier: MIT
pragma solidity >=0.8.25 <0.9.0;

import { Test } from "forge-std/src/Test.sol";
import { console } from "forge-std/src/console.sol";
import { Trade } from "../src/Trade.sol";
import { TradeFactory } from "../src/Factory.sol";
import { FheEnabled } from "../util/FheHelper.sol";
import { Permission, PermissionHelper } from "../util/PermissionHelper.sol";

import { inEuint128, euint128 } from "@fhenixprotocol/contracts/FHE.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/// @dev If this is your first time with Forge, read this tutorial in the Foundry Book:
/// https://book.getfoundry.sh/forge/writing-tests
contract TradeTest is Test, FheEnabled {
    TradeFactory internal tradeFactory;
    Trade trade;
    PermissionHelper private permitHelper;

    address public owner;
    uint256 public ownerPrivateKey;

    uint256 private receiverPrivateKey;
    address private receiver;

    Permission private permission;
    Permission private permissionReceiver;

    /// @dev A function invoked before each test case is run.
    function setUp() public virtual {
        // Required to mock FHE operations - do not forget to call this function
        // *****************************************************
        initializeFhe();
        // *****************************************************

        receiverPrivateKey = 0xB0B;
        receiver = vm.addr(receiverPrivateKey);

        ownerPrivateKey = 0xA11CE;
        owner = vm.addr(ownerPrivateKey);

        vm.startPrank(owner);
        vm.deal(owner, 10 ether);

        // Instantiate the contract-under-test.
        tradeFactory = new TradeFactory();
        trade = Trade(tradeFactory.deployTrade{value: 1 ether}());
        
      //  token = new ExampleToken("hello", "TST", 10_000_000);
       // permitHelper = new PermissionHelper(address(token));

       // permission = permitHelper.generatePermission(ownerPrivateKey);
       // permissionReceiver = permitHelper.generatePermission(receiverPrivateKey);

        vm.stopPrank();
    }

      // @dev Failing test for mintEncrypted function with unauthorized minter
    function testTradeOwner() public {
        vm.startPrank(owner);
        trade.addPrice("EUR_USD", encrypt32(10000));
        //trade.addTrade("EUR_USD", encrypt128(100000), encryptBool(1));
        //trade.addPrice("EUR_USD", 20000);
        //trade.addTrade("EUR_USD", encrypt128(10), encryptBool(0));

       //int128 pl = trade.getPl("EUR_USD");
        //console.log("pl");
        //console.logInt(pl);

    }

}
