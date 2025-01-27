const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 创建日志目录和文件
const LOG_DIR = 'logs';
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// 获取当前日期作为日志文件名
const getLogFileName = () => {
    const now = new Date();
    return path.join(LOG_DIR, `lottery_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.log`);
};

// 写入日志
function writeLog(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;
    
    // 写入日志文件
    fs.appendFileSync(getLogFileName(), logMessage);
    
    // 同时输出到控制台
    console.log(message);
}

// 记录交易详情
async function logTransactionDetails(txHash, description) {
    try {
        const tx = await ethers.provider.getTransaction(txHash);
        const receipt = await ethers.provider.getTransactionReceipt(txHash);
        
        const details = [
            `\n交易详情 - ${description}:`,
            `交易哈希: ${txHash}`,
            `发送方: ${tx.from}`,
            `接收方: ${tx.to}`,
            `状态: ${receipt.status ? '成功' : '失败'}`,
            `Gas使用: ${receipt.gasUsed.toString()}`,
            `区块号: ${receipt.blockNumber}`
        ].join('\n');
        
        writeLog(details, receipt.status ? 'SUCCESS' : 'FAILED');
    } catch (error) {
        writeLog(`获取交易详情失败 - ${txHash}: ${error.message}`, 'ERROR');
    }
}

async function main() {
    // 从环境变量获取合约地址
    const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
    const LOTTERY_ADDRESS = process.env.LOTTERY_ADDRESS;
    
    if (!TOKEN_ADDRESS || !LOTTERY_ADDRESS) {
        throw new Error("请在.env文件中设置TOKEN_ADDRESS和LOTTERY_ADDRESS");
    }
    
    writeLog("\n========== 合约信息 ==========");
    writeLog(`代币合约: ${TOKEN_ADDRESS}`);
    writeLog(`彩票合约: ${LOTTERY_ADDRESS}`);
    
    // 获取合约实例
    const TestERC777 = await ethers.getContractFactory("TestERC777");
    const LotteryERC777 = await ethers.getContractFactory("LotteryERC777");
    const token = TestERC777.attach(TOKEN_ADDRESS);
    const lottery = LotteryERC777.attach(LOTTERY_ADDRESS);
    
    writeLog(`开始监控彩票合约: ${LOTTERY_ADDRESS}`);
    writeLog(`代币合约: ${TOKEN_ADDRESS}`);
    
    // 显示初始状态
    writeLog("\n初始状态:");
    await printLotteryStatus(lottery);
    
    writeLog("\n🔍 监控已启动，等待新交易...");
    
    // 监听彩票购买事件
    lottery.on("TicketPurchased", async (buyer, number, event) => {
        const block = await event.getBlock();
        const timestamp = new Date(block.timestamp * 1000);
        
        const message = [
            "\n🎫 新彩票购买:",
            `时间: ${timestamp.toLocaleString()}`,
            `购买者: ${buyer}`,
            `彩票号码: ${number}`,
            `交易哈希: ${event.transactionHash}`
        ].join('\n');
        
        writeLog(message, 'TICKET');
        await logTransactionDetails(event.transactionHash, '彩票购买');
        await printLotteryStatus(lottery);
    });
    
    // 监听开奖事件
    lottery.on("LotteryDrawn", async (winningNumber, winnerCount, event) => {
        const block = await event.getBlock();
        const timestamp = new Date(block.timestamp * 1000);
        
        const message = [
            "\n🎯 开奖结果:",
            `时间: ${timestamp.toLocaleString()}`,
            `中奖号码: ${winningNumber}`,
            `中奖人数: ${winnerCount}`,
            `交易哈希: ${event.transactionHash}`
        ].join('\n');
        
        writeLog(message, 'DRAW');
        await logTransactionDetails(event.transactionHash, '开奖');
        await printLotteryStatus(lottery);
    });
    
    // 监听奖金分配事件
    lottery.on("PrizesDistributed", async (prizePerWinner, event) => {
        const block = await event.getBlock();
        const timestamp = new Date(block.timestamp * 1000);
        
        const message = [
            "\n💰 奖金分配:",
            `时间: ${timestamp.toLocaleString()}`,
            `每人奖金: ${ethers.utils.formatEther(prizePerWinner)} TEST`,
            `交易哈希: ${event.transactionHash}`
        ].join('\n');
        
        writeLog(message, 'PRIZE');
        await logTransactionDetails(event.transactionHash, '奖金分配');
        await printLotteryStatus(lottery);
    });
}

async function printLotteryStatus(lottery) {
    const statusMessages = ["当前彩票状态:"];
    
    // 获取所有彩票
    let ticketCount = 0;
    const tickets = [];
    try {
        while (true) {
            const ticket = await lottery.tickets(ticketCount);
            tickets.push({
                buyer: ticket.buyer,
                number: ticket.number,
                timestamp: new Date(ticket.timestamp.toNumber() * 1000)
            });
            ticketCount++;
        }
    } catch (error) {
        // 到达票数上限会抛出错误,这是预期的行为
    }
    
    statusMessages.push(`总票数: ${ticketCount}`);
    if (ticketCount > 0) {
        statusMessages.push("彩票列表:");
        tickets.forEach((ticket, index) => {
            statusMessages.push(`${index + 1}. 号码: ${ticket.number}`);
            statusMessages.push(`   购买者: ${ticket.buyer}`);
            statusMessages.push(`   购买时间: ${ticket.timestamp.toLocaleString()}`);
        });
    }
    
    const isDrawn = await lottery.isDrawn();
    statusMessages.push(`开奖状态: ${isDrawn ? "已开奖" : "未开奖"}`);
    
    if (isDrawn) {
        const winningNumber = await lottery.winningNumber();
        const winnerCount = await lottery.winnerCount();
        statusMessages.push(`中奖号码: ${winningNumber}`);
        statusMessages.push(`中奖人数: ${winnerCount}`);
    }
    
    writeLog(statusMessages.join('\n'), 'STATUS');
}

main()
    .then(() => {
        writeLog("监控脚本启动成功", 'STARTUP');
    })
    .catch((error) => {
        writeLog(`监控脚本错误: ${error.message}`, 'ERROR');
        process.exit(1);
    });

// 防止脚本退出
process.on("SIGINT", () => {
    writeLog("\n停止监控", 'SHUTDOWN');
    process.exit();
}); 