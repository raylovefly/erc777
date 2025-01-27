const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    // 合约地址
    const TOKEN_ADDRESS = "0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4";
    
    // 发送方私钥
    const SENDER_PRIVATE_KEY = "bb99ce471f91235b7f3803a94bea288cc29aa961a96c1a97883056791f7d7821";
    
    // 读取账户信息
    const accountsData = JSON.parse(fs.readFileSync('test-accounts.json', 'utf8'));
    const accounts = accountsData.accounts;
    
    // 连接到网络并获取发送方账户
    const provider = ethers.provider;
    const senderWallet = new ethers.Wallet(SENDER_PRIVATE_KEY, provider);
    
    // 获取合约实例
    const TestERC777 = await ethers.getContractFactory("TestERC777");
    const token = TestERC777.attach(TOKEN_ADDRESS).connect(senderWallet);
    
    // 转账金额: 100万代币
    const tokenAmount = ethers.utils.parseEther("1000000");
    
    // 处理单个账户转账的函数
    async function processTransfer(account) {
        try {
            console.log(`\n开始处理账户 #${account.index}: ${account.address}`);
            
            // 检查当前余额
            const oldBalance = await token.balanceOf(account.address);
            console.log(`当前代币余额: ${ethers.utils.formatEther(oldBalance)} TEST`);
            
            // 执行转账
            console.log("发起转账...");
            const tx = await token.send(account.address, tokenAmount, "0x");
            
            // 等待交易确认
            const receipt = await tx.wait();
            console.log(`✅ 账户 #${account.index} 转账已确认:`);
            console.log(`- 交易哈希: ${receipt.transactionHash}`);
            console.log(`- 区块号: ${receipt.blockNumber}`);
            console.log(`- Gas使用: ${receipt.gasUsed.toString()}`);
            
            // 检查新余额
            const newBalance = await token.balanceOf(account.address);
            console.log(`更新后代币余额: ${ethers.utils.formatEther(newBalance)} TEST`);
            
            return {
                success: true,
                account: account,
                txHash: receipt.transactionHash
            };
        } catch (error) {
            console.error(`❌ 账户 #${account.index} 转账失败:`, error.message);
            return {
                success: false,
                account: account,
                error: error.message
            };
        }
    }
    
    try {
        console.log("\n========== 批量转账代币 ==========");
        console.log("代币合约:", TOKEN_ADDRESS);
        console.log("发送方地址:", await senderWallet.getAddress());
        console.log(`总共${accounts.length}个账户需要转账`);
        
        const pendingTransfers = [];
        
        // 启动所有转账
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            
            // 创建转账Promise并存储
            const transferPromise = processTransfer(account);
            pendingTransfers.push(transferPromise);
            
            // 等待1秒后再发起下一笔交易
            if (i < accounts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // 等待所有转账完成
        console.log("\n等待所有转账确认...");
        const transferResults = await Promise.all(pendingTransfers);
        
        // 统计结果
        const successful = transferResults.filter(r => r.success).length;
        const failed = transferResults.filter(r => !r.success).length;
        
        console.log("\n========== 转账统计 ==========");
        console.log(`成功: ${successful}`);
        console.log(`失败: ${failed}`);
        
        // 如果有失败的转账，显示详细信息
        if (failed > 0) {
            console.log("\n失败的转账:");
            transferResults
                .filter(r => !r.success)
                .forEach(result => {
                    console.log(`账户 #${result.account.index}: ${result.error}`);
                });
        }
        
        console.log("\n========== 完成 ==========");
        console.log("所有转账操作已完成!");
        
    } catch (error) {
        console.error("\n❌ 执行过程中出现错误:");
        console.error("错误信息:", error.message);
        console.error("错误详情:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("脚本执行失败:", error);
        process.exit(1);
    }); 