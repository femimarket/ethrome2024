// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./Trade.sol";
import "@fhenixprotocol/contracts/FHE.sol";


contract TradeFactory {
    event TradeDeployed(address deployedAddress);
    uint256 public deploymentFee = 0.1 ether;

    function deployTrade() public payable returns (address) {
        require(msg.value >= deploymentFee, "Insufficient fee");

        Trade newTrade = new Trade(msg.sender);
        emit TradeDeployed(address(newTrade));
        return address(newTrade);
    }
}