const { ethers } = require("hardhat");

async function main() {
    // 合约地址
    const TOKEN_ADDRESS = "0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4";
    const LOTTERY_ADDRESS = "0x976E50489b0E11EA619188c221325E36438fB4e5";
    
    // 获取合约实例
    const TestERC777 = await ethers.getContractFactory("TestERC777");
    const token = TestERC777.attach(TOKEN_ADDRESS);
    
    // 使用第一个测试账户
    const testAccount = {
        address: "0xb557cA258f4a20C3918F89e9a040c38Ba7F2e5c7",
        privateKey: "0xfe9b4ff140562fc2b4f00c15f59bbf6286710ffa2e729ff0a3bfb7c87fd1ca8d"
    };
    
    // 连接钱包
    const wallet = new ethers.Wallet(testAccount.privateKey, ethers.provider);
    const tokenWithSigner = token.connect(wallet);
    
    // 等待交易确认的辅助函数
    async function waitForTx(tx, desc) {
        try {
            console.log(`等待${desc}交易确认...`);
            const receipt = await tx.wait();
            console.log(`✅ ${desc}交易已确认:`);
            console.log(`- 交易哈希: ${receipt.transactionHash}`);
            console.log(`- 区块号: ${receipt.blockNumber}`);
            console.log(`- Gas使用: ${receipt.gasUsed.toString()}`);
            return receipt;
        } catch (error) {
            console.error(`❌ ${desc}交易失败:`, error.message);
            throw error;
        }
    }
    
    try {
        console.log("\n========== 测试信息 ==========");
        console.log("代币合约:", TOKEN_ADDRESS);
        console.log("彩票合约:", LOTTERY_ADDRESS);
        console.log("测试账户:", testAccount.address);
        
        // 检查余额
        const balance = await token.balanceOf(testAccount.address);
        console.log("\n当前代币余额:", ethers.utils.formatEther(balance), "TEST");
        
        // 购买彩票号码97（参考成功案例）
        const amount = ethers.utils.parseEther("10000.05"); // 10000.05代表选择号码05
        console.log("\n========== 购买彩票 ==========");
        console.log("购买金额:", ethers.utils.formatEther(amount), "TEST");
        
        // 使用transfer方法
        console.log("\n使用transfer方法转账...");
        const tx = await tokenWithSigner.transfer(LOTTERY_ADDRESS, amount);
        await waitForTx(tx, "购买彩票");
        
        // 检查新余额
        const newBalance = await token.balanceOf(testAccount.address);
        console.log("\n更新后代币余额:", ethers.utils.formatEther(newBalance), "TEST");
        
        console.log("\n========== 完成 ==========");
        console.log("测试交易已完成，请在区块链浏览器中查看详细信息");
        
    } catch (error) {
        console.error("\n❌ 测试过程中出现错误:");
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