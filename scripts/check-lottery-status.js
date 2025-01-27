const { ethers } = require("hardhat");

async function main() {
    // 合约地址
    const LOTTERY_ADDRESS = "0x976E50489b0E11EA619188c221325E36438fB4e5";
    const TOKEN_ADDRESS = "0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4";
    
    // 获取合约实例
    const LotteryERC777 = await ethers.getContractFactory("LotteryERC777");
    const lottery = LotteryERC777.attach(LOTTERY_ADDRESS);
    
    const TestERC777 = await ethers.getContractFactory("TestERC777");
    const token = TestERC777.attach(TOKEN_ADDRESS);
    
    console.log("\n========== 彩票系统状态 ==========");
    
    // 检查合约余额
    const balance = await token.balanceOf(LOTTERY_ADDRESS);
    console.log(`合约代币余额: ${ethers.utils.formatEther(balance)} TEST`);
    
    // 获取彩票信息
    let ticketCount = 0;
    let tickets = [];
    
    // 尝试获取所有彩票直到失败
    try {
        while (true) {
            const ticket = await lottery.tickets(ticketCount);
            if (ticket.buyer === "0x0000000000000000000000000000000000000000") break;
            tickets.push(ticket);
            ticketCount++;
        }
    } catch (error) {
        // 到达数组末尾
    }
    
    console.log(`\n当前彩票数量: ${ticketCount}`);
    
    // 显示彩票列表
    if (ticketCount > 0) {
        console.log("\n彩票列表:");
        for (let i = 0; i < ticketCount; i++) {
            const ticket = tickets[i];
            const time = new Date(ticket.timestamp.toNumber() * 1000).toLocaleString();
            console.log(`#${i + 1}: 地址=${ticket.buyer}, 号码=${ticket.number}, 时间=${time}`);
        }
    }
    
    // 获取中奖信息
    const winningNumber = await lottery.winningNumber();
    console.log(`\n中奖号码: ${winningNumber}`);
    
    const winnerCount = await lottery.winnerCount();
    console.log(`中奖人数: ${winnerCount}`);
    
    // 获取开奖状态
    const isDrawn = await lottery.isDrawn();
    console.log(`\n是否已开奖: ${isDrawn}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("脚本执行失败:", error);
        process.exit(1);
    }); 