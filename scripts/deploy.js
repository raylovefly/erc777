const { ethers, network } = require("hardhat");
const fs = require('fs');
const path = require('path');

// 合约地址配置文件
const CONTRACT_CONFIG_FILE = '.contract-addresses.json';

// 保存合约地址到配置文件
function saveContractAddresses(addresses) {
    fs.writeFileSync(
        CONTRACT_CONFIG_FILE,
        JSON.stringify(addresses, null, 2)
    );
}

// 更新脚本文件中的合约地址
function updateScriptAddresses(tokenAddress, lotteryAddress) {
    const scriptsDir = path.join(__dirname);
    const files = fs.readdirSync(scriptsDir);
    
    files.forEach(file => {
        if (file.endsWith('.js') && file !== 'deploy.js') {
            const filePath = path.join(scriptsDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // 更新代币合约地址
            content = content.replace(
                /const TOKEN_ADDRESS = ["']0x[a-fA-F0-9]{40}["']/g,
                `const TOKEN_ADDRESS = "${tokenAddress}"`
            );
            
            // 更新彩票合约地址
            content = content.replace(
                /const LOTTERY_ADDRESS = ["']0x[a-fA-F0-9]{40}["']/g,
                `const LOTTERY_ADDRESS = "${lotteryAddress}"`
            );
            
            fs.writeFileSync(filePath, content);
            console.log(`Updated contract addresses in ${file}`);
        }
    });
}

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("部署账户:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("账户余额:", ethers.utils.formatEther(balance), "DFC");

    // 部署 TestERC777
    const initialSupply = ethers.utils.parseEther("100000000000"); // 1000亿代币
    const defaultOperators = [deployer.address]; // 设置部署者为操作者

    console.log("\n部署 TestERC777...");
    const TestERC777 = await ethers.getContractFactory("TestERC777");
    const token = await TestERC777.deploy(initialSupply, defaultOperators);
    await token.deployed();

    console.log("TestERC777 部署地址:", token.address);
    console.log("初始供应量:", ethers.utils.formatEther(initialSupply), "TEST");
    console.log("默认操作者:", defaultOperators[0]);

    // 部署 LotteryERC777
    console.log("\n部署 LotteryERC777...");
    const LotteryERC777 = await ethers.getContractFactory("LotteryERC777");
    const lottery = await LotteryERC777.deploy(token.address);
    await lottery.deployed();

    console.log("LotteryERC777 部署地址:", lottery.address);
    
    // 保存合约地址
    const addresses = {
        token: token.address,
        lottery: lottery.address,
        network: network.name,
        timestamp: new Date().toISOString()
    };
    saveContractAddresses(addresses);
    console.log("\n合约地址已保存到:", CONTRACT_CONFIG_FILE);
    
    // 更新其他脚本中的合约地址
    console.log("\n更新测试脚本中的合约地址...");
    updateScriptAddresses(token.address, lottery.address);
    
    console.log("\n部署完成！");
    console.log("请将以下地址添加到您的文档中：");
    console.log("代币合约:", token.address);
    console.log("彩票合约:", lottery.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("部署失败:", error);
        process.exit(1);
    }); 