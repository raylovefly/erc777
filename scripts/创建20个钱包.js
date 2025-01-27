const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    // 读取现有账户信息
    let existingAccounts = [];
    try {
        const fileContent = fs.readFileSync('test-accounts.json', 'utf8');
        const data = JSON.parse(fileContent);
        existingAccounts = data.accounts || [];
        console.log(`已读取${existingAccounts.length}个现有账户`);
    } catch (error) {
        console.log("未找到现有账户文件或文件损坏，将创建新文件");
    }

    // 获取当前最大索引
    const maxIndex = existingAccounts.length > 0 
        ? Math.max(...existingAccounts.map(a => a.index))
        : 0;
    
    // 创建20个测试钱包
    console.log("\n========== 创建测试钱包 ==========");
    const testWallets = Array(20).fill(0).map(() => ethers.Wallet.createRandom().connect(ethers.provider));
    const deployer = (await ethers.getSigners())[0];
    
    // 准备新账户数据
    const newAccounts = testWallets.map((wallet, index) => ({
        index: maxIndex + index + 1,
        address: wallet.address,
        privateKey: wallet.privateKey,
        dfcBalance: "0"
    }));
    
    console.log("\n========== 新建测试钱包信息 ==========");
    console.log("主钱包地址:", deployer.address);
    console.log("\n新建测试钱包列表:");
    newAccounts.forEach(account => {
        console.log(`${account.index}. ${account.address}`);
    });
    
    // 等待交易确认的辅助函数
    async function waitForTx(tx, desc) {
        try {
            console.log(`等待${desc}交易确认...`);
            const receipt = await tx.wait();
            console.log(`✅ ${desc}交易已确认, 区块号: ${receipt.blockNumber}, Gas使用: ${receipt.gasUsed.toString()}`);
            return receipt;
        } catch (error) {
            console.error(`❌ ${desc}交易失败:`, error.message);
            throw error;
        }
    }
    
    try {
        // 转DFC
        console.log("\n========== 转DFC ==========");
        const dfcAmount = ethers.utils.parseEther("0.2"); // 0.2 DFC
        console.log("计划: 向每个测试钱包转账0.2 DFC");
        
        for (let i = 0; i < newAccounts.length; i++) {
            const account = newAccounts[i];
            const wallet = testWallets[i];
            console.log(`\n正在处理第${account.index}个钱包: ${wallet.address}`);
            
            // 执行转账
            console.log("发起转账...");
            const tx = await deployer.sendTransaction({
                to: wallet.address,
                value: dfcAmount
            });
            await waitForTx(tx, `DFC转账到钱包${account.index}`);
            
            // 更新余额
            const newBalance = await ethers.provider.getBalance(wallet.address);
            account.dfcBalance = ethers.utils.formatEther(newBalance);
            console.log(`更新后DFC余额: ${account.dfcBalance}`);
            
            // 每次转账后等待3秒
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // 合并新旧账户
        const allAccounts = [...existingAccounts, ...newAccounts];
        
        // 保存账户信息
        const data = {
            accounts: allAccounts,
            timestamp: new Date().toISOString()
        };
        
        // 创建Markdown内容
        const markdownContent = `# 测试地址管理

## 测试账户列表

${allAccounts.map(account => `
### 账户 #${account.index}

- 地址: ${account.address}
- 私钥: ${account.privateKey}
- DFC余额: ${account.dfcBalance} DFC
`).join('\n')}

## 更新时间

${new Date().toLocaleString()}
`;
        
        // 保存文件
        fs.writeFileSync('test-accounts.json', JSON.stringify(data, null, 2));
        fs.writeFileSync('test-accounts.md', markdownContent);
        
        console.log("\n========== 完成 ==========");
        console.log("所有操作已成功执行!");
        console.log(`共有${allAccounts.length}个账户:`);
        console.log(`- ${existingAccounts.length}个现有账户`);
        console.log(`- ${newAccounts.length}个新建账户`);
        console.log("\n账户信息已保存到:");
        console.log("- test-accounts.json");
        console.log("- test-accounts.md");
        
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