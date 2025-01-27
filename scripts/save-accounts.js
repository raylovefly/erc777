const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    // 获取合约实例
    const TestERC777 = await ethers.getContractFactory("TestERC777");
    const token = TestERC777.attach("0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4");

    // 第一组测试账户（从10个账户测试脚本.js）
    const firstGroupAccounts = [
        {
            index: 1,
            address: "0x1d469AAE5ee8714cf679b6f098DDb8468d13897D",
            privateKey: "0x4f2ee0271ac8d1a308cf3c42b14fc1642f8c6fe8f6e9f2c5e9d69dc1dc1a3f5a",
            dfcBalance: "0.1",
            tokenBalance: "9999.73"
        },
        {
            index: 2,
            address: "0x1E23b8c8b495e47911E4d17bB2776F3Bd39a258D",
            privateKey: "0x2a9eac00d9d4a8b7a2234ad6c72c5c25f0e7b8a0c8f6e4d2c0b9f8e7d6c5b4a3",
            dfcBalance: "0.1",
            tokenBalance: "9999.80"
        },
        {
            index: 3,
            address: "0xeb1D1F78b08c7624173dBE04b03318a5cBFa2566",
            privateKey: "0x3b8f7d6e5c4b3a2d1e0f9c8b7a6d5e4f3c2b1a0d9e8f7c6b5a4d3c2b1a0e9d8f",
            dfcBalance: "0.1",
            tokenBalance: "9999.01"
        },
        {
            index: 4,
            address: "0xf3C7EdebcE6237a02Ca2530b2Dcca02Dd8874100",
            privateKey: "0x4c9e8d7f6b5a4c3b2d1e0f9c8b7a6d5e4f3c2b1a0d9e8f7c6b5a4d3c2b1a0e9d",
            dfcBalance: "0.1",
            tokenBalance: "9999.44"
        },
        {
            index: 5,
            address: "0x3b81eC3866e36a361B0CF728e1Ea563AcADbF3f3",
            privateKey: "0x5d0f9e8d7c6b5a4f3e2d1c0b9a8d7e6f5c4b3a2d1e0f9c8b7a6d5e4f3c2b1a0f",
            dfcBalance: "0.1",
            tokenBalance: "9999.85"
        },
        {
            index: 6,
            address: "0x47Dcb4599ffFa7663564e9d6894d64392c85B90F",
            privateKey: "0x6e1f0d9c8b7a6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1f",
            dfcBalance: "0.1",
            tokenBalance: "9999.41"
        },
        {
            index: 7,
            address: "0x86f8Ce910c26071EE27CBe6Bb58eF06EAeAdAb2d",
            privateKey: "0x7f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2f",
            dfcBalance: "0.1",
            tokenBalance: "9999.17"
        },
        {
            index: 8,
            address: "0x072fD1D213b1C803FFc4eC798bd4E6f6C4F5699d",
            privateKey: "0x8f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3f",
            dfcBalance: "0.1",
            tokenBalance: "9999.53"
        },
        {
            index: 9,
            address: "0x87fa1Af1994bB8dD16DAE7E71D8F0b0083683981",
            privateKey: "0x9f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4f",
            dfcBalance: "0.1",
            tokenBalance: "9999.49"
        },
        {
            index: 10,
            address: "0xD2B8F860859eFC59c6d3b0E35823d38D916d0bC4",
            privateKey: "0x0f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5f",
            dfcBalance: "0.1",
            tokenBalance: "9999.34"
        }
    ];

    // 第二组测试账户（从test-lottery.js）
    const secondGroupAccounts = [
        {
            index: 11,
            address: "0x15237FD9061f3eFbd0bd054aCC93f79b41004bA9",
            dfcBalance: "0.1",
            tokenBalance: "9999.89"
        },
        {
            index: 12,
            address: "0x633a246e99A97997aFeA11478845FDf067BF268B",
            dfcBalance: "0.1",
            tokenBalance: "9999.82"
        },
        {
            index: 13,
            address: "0xB073e03Ee60b3d2AafE7b27817195d054F172D41",
            dfcBalance: "0.1",
            tokenBalance: "9999.55"
        },
        {
            index: 14,
            address: "0x2a7a5DeBA41ece8D3aa0aaa5F7B3e4BE6D89B70d",
            dfcBalance: "0.1",
            tokenBalance: "9999.55"
        },
        {
            index: 15,
            address: "0x6C50fC8A5F7143f5c926488c6902A14dbEbe19f2",
            dfcBalance: "0.1",
            tokenBalance: "9999.70"
        },
        {
            index: 16,
            address: "0xF3896Ec29B747AdeF1a27a80F0F27cA55EC6d18A",
            dfcBalance: "0.1",
            tokenBalance: "9999.42"
        },
        {
            index: 17,
            address: "0x8dA1619ABFAfeE063ed6e3Fb1B724D6211243Cff",
            dfcBalance: "0.1",
            tokenBalance: "9999.07"
        },
        {
            index: 18,
            address: "0x895322EB13d066Bc3b8419519424F5E86Ce99B1B",
            dfcBalance: "0.1",
            tokenBalance: "9999.84"
        },
        {
            index: 19,
            address: "0x7DeeFF2aF696F777Ab3F784Da33638A9Ca151bc2",
            dfcBalance: "0.1",
            tokenBalance: "9999.92"
        },
        {
            index: 20,
            address: "0x3325ebaE58a74532885522Fb33E33740899611c2",
            dfcBalance: "0.1",
            tokenBalance: "9999.61"
        }
    ];
    
    // 合并所有账户
    const allAccounts = [...firstGroupAccounts, ...secondGroupAccounts];
    
    // 更新实时余额
    console.log("正在获取实时余额...");
    for (const account of allAccounts) {
        try {
            // 获取DFC余额
            const dfcBalance = await ethers.provider.getBalance(account.address);
            account.dfcBalance = ethers.utils.formatEther(dfcBalance);
            
            // 获取代币余额
            const tokenBalance = await token.balanceOf(account.address);
            account.tokenBalance = ethers.utils.formatEther(tokenBalance);
        } catch (error) {
            console.log(`获取账户 ${account.address} 余额失败:`, error.message);
        }
    }
    
    // 保存到文件
    const data = {
        accounts: allAccounts,
        contracts: {
            token: "0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4",
            lottery: "0x976E50489b0E11EA619188c221325E36438fB4e5"
        },
        timestamp: new Date().toISOString()
    };
    
    // 创建测试地址管理文档
    const markdownContent = `# 测试地址管理

## 合约地址

- 代币合约: ${data.contracts.token}
- 彩票合约: ${data.contracts.lottery}

## 测试账户列表

${allAccounts.map(account => `
### 账户 #${account.index}

- 地址: ${account.address}
${account.privateKey ? `- 私钥: ${account.privateKey}` : ''}
- DFC余额: ${account.dfcBalance} DFC
- 代币余额: ${account.tokenBalance} TEST
`).join('\n')}

## 更新时间

${new Date().toLocaleString()}
`;
    
    // 保存JSON和Markdown文件
    fs.writeFileSync('test-accounts.json', JSON.stringify(data, null, 2));
    fs.writeFileSync('test-accounts.md', markdownContent);
    
    // 打印信息
    console.log("\n已保存测试账户信息到:");
    console.log("- test-accounts.json (JSON格式)");
    console.log("- test-accounts.md (Markdown格式)");
    
    console.log("\n账户信息概览:");
    allAccounts.forEach(account => {
        console.log(`\n账户 #${account.index}:`);
        console.log(`地址: ${account.address}`);
        if (account.privateKey) {
            console.log(`私钥: ${account.privateKey}`);
        }
        console.log(`DFC余额: ${account.dfcBalance} DFC`);
        console.log(`代币余额: ${account.tokenBalance} TEST`);
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("脚本执行失败:", error);
        process.exit(1);
    }); 