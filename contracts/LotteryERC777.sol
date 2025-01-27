// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/utils/introspection/ERC1820Implementer.sol";
import "./TestERC777.sol";

contract LotteryERC777 is IERC777Recipient, ERC1820Implementer {
    // ERC1820Registry 地址
    IERC1820Registry constant internal ERC1820_REGISTRY = IERC1820Registry(0xa38BBaD0A6Ad97420F85b7aD0E4B5306ba4F4F19);
    
    CustomERC777 public token;
    
    struct Ticket {
        address buyer;
        uint8 number;
        uint256 timestamp;
    }
    
    Ticket[] public tickets;
    uint8 public winningNumber;
    uint256 public winnerCount;
    bool public isDrawn;
    mapping(address => uint256) public lastPurchaseTime;
    
    event TicketPurchased(address buyer, uint8 number);
    event LotteryDrawn(uint8 winningNumber, uint256 winnerCount);
    event PrizesDistributed(uint256 prizePerWinner);
    
    constructor(address tokenAddress) {
        token = CustomERC777(tokenAddress);
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
        require(to == address(this), "LotteryERC777: wrong recipient");
        require(msg.sender == address(token), "LotteryERC777: invalid token");
        
        // 购买彩票: 10000.XX 代币
        if (amount >= 10000 * 1e18 && amount < 10001 * 1e18) {
            // 正确解析小数点后两位作为彩票号码
            uint8 ticketNumber = uint8((amount / 1e16) % 100);
            require(ticketNumber < 100, "Invalid ticket number");
            require(block.timestamp >= lastPurchaseTime[from] + 24 hours, "Can only buy once per 24h");
            
            tickets.push(Ticket({
                buyer: from,
                number: ticketNumber,
                timestamp: block.timestamp
            }));
            
            lastPurchaseTime[from] = block.timestamp;
            emit TicketPurchased(from, ticketNumber);
        }
        // 分配奖金: 500万代币，同时触发开奖
        else if (amount == 5000000 * 1e18 && !isDrawn) {
            require(tickets.length > 0, "No tickets purchased");
            
            // 使用区块哈希生成中奖号码
            winningNumber = uint8(uint256(blockhash(block.number - 1)) % 100);
            winnerCount = 0;
            
            // 统计中奖人数
            for (uint i = 0; i < tickets.length; i++) {
                if (tickets[i].number == winningNumber) {
                    winnerCount++;
                }
            }
            
            isDrawn = true;
            emit LotteryDrawn(winningNumber, winnerCount);
            
            // 如果有人中奖，分配奖金
            if (winnerCount > 0) {
                // 获取合约的总余额作为奖池
                uint256 totalPrize = token.balanceOf(address(this));
                // 计算每个中奖者应得的奖金
                uint256 prizePerWinner = totalPrize / winnerCount;
                
                // 遍历所有彩票，找出中奖者并发放奖金
                for (uint i = 0; i < tickets.length; i++) {
                    if (tickets[i].number == winningNumber) {
                        token.send(tickets[i].buyer, prizePerWinner, "");
                    }
                }
                
                emit PrizesDistributed(prizePerWinner);
            }
            
            // 重置彩票状态
            delete tickets;
            winnerCount = 0;
            isDrawn = false;
        }
    }
} 