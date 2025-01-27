// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/utils/introspection/ERC1820Implementer.sol";

contract TestERC777Recipient is IERC777Recipient, ERC1820Implementer {
    // ERC1820Registry 地址
    IERC1820Registry constant internal ERC1820_REGISTRY = IERC1820Registry(0xa38BBaD0A6Ad97420F85b7aD0E4B5306ba4F4F19);
    
    // 用于记录接收到的代币信息
    event TokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes userData,
        bytes operatorData
    );
    
    // 记录最后一次接收到的代币信息
    address public lastOperator;
    address public lastFrom;
    uint256 public lastAmount;
    bytes public lastUserData;
    bytes public lastOperatorData;
    
    constructor() {
        // 注册接口
        ERC1820_REGISTRY.setInterfaceImplementer(
            address(this),
            keccak256("ERC777TokensRecipient"),
            address(this)
        );
    }
    
    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        require(to == address(this), "ERC777Recipient: wrong recipient");
        
        // 更新最后接收到的代币信息
        lastOperator = operator;
        lastFrom = from;
        lastAmount = amount;
        lastUserData = userData;
        lastOperatorData = operatorData;
        
        // 触发事件
        emit TokensReceived(operator, from, to, amount, userData, operatorData);
    }
} 