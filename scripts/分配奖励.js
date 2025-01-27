const { ethers } = require("hardhat");

async function main() {
    // 合约地址
    const TOKEN_ADDRESS = "0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4";
    const LOTTERY_ADDRESS = "0x976E50489b0E11EA619188c221325E36438fB4e5";
    
    // 获取合约实例
    const TestERC777 = await ethers.getContractFactory("TestERC777");
    const token = TestERC777.attach(TOKEN_ADDRESS);
    
    console.log("开始执行奖金分配...");
    
    // 发送500万代币到彩票合约分配奖金
    const prizeAmount = ethers.utils.parseEther("5000000");
    console.log(`发送 ${ethers.utils.formatEther(prizeAmount)} TEST 到彩票合约分配奖金`);
    
    const tx = await token.send(LOTTERY_ADDRESS, prizeAmount, "0x");
    console.log("等待交易确认...");
    const receipt = await tx.wait();
    
    console.log(`✅ 奖金分配交易已确认，交易哈希: ${receipt.transactionHash}`);
    console.log(`Gas使用: ${receipt.gasUsed.toString()}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("脚本执行失败:", error);
        process.exit(1);
    }); 