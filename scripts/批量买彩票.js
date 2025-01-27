const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    // 合约地址
    const TOKEN_ADDRESS = "0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4";
    const LOTTERY_ADDRESS = "0x976E50489b0E11EA619188c221325E36438fB4e5";
    
    // 读取测试账户
    const accountsData = JSON.parse(fs.readFileSync('test-accounts.json', 'utf8'));
    const accounts = accountsData.accounts;
    
    // 处理单个账户购票的函数
    async function processBuyTicket(account, index) {
        try {
            // 连接到账户
            const wallet = new ethers.Wallet(account.privateKey, ethers.provider);
            const token = await ethers.getContractFactory("TestERC777")
                .then(factory => factory.attach(TOKEN_ADDRESS).connect(wallet));
            
            // 计算转账金额 (10000.00 + index/100)
            const amount = ethers.utils.parseEther((10000 + index/100).toFixed(2));
            
            // 执行转账
            const tx = await token.transfer(LOTTERY_ADDRESS, amount);
            await tx.wait();
            
            return {
                success: true,
                account: account,
                amount: ethers.utils.formatEther(amount)
            };
        } catch (error) {
            return {
                success: false,
                account: account,
                error: error.message
            };
        }
    }
    
    try {
        console.log("\n========== 批量测试彩票购买 ==========");
        console.log("代币合约:", TOKEN_ADDRESS);
        console.log("彩票合约:", LOTTERY_ADDRESS);
        console.log(`总共${accounts.length}个测试账户`);
        
        const pendingTransfers = [];
        
        // 启动所有转账
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            
            // 创建转账Promise并存储
            const transferPromise = processBuyTicket(account, i);
            pendingTransfers.push(transferPromise);
            
            // 等待1秒后再发起下一笔交易
            if (i < accounts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // 等待所有转账完成
        const results = await Promise.all(pendingTransfers);
        
        // 只显示失败的交易
        const failed = results.filter(r => !r.success);
        if (failed.length > 0) {
            console.log("\n失败的交易:");
            failed.forEach(result => {
                console.log(`账户 ${result.account.address}: ${result.error}`);
            });
        }
        
        // 显示统计
        console.log("\n========== 统计 ==========");
        console.log(`成功: ${results.length - failed.length}`);
        console.log(`失败: ${failed.length}`);
        
    } catch (error) {
        console.error("\n❌ 执行出错:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("脚本执行失败:", error);
        process.exit(1);
    }); 