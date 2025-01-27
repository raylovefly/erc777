/**
 * ERC777 回调函数测试脚本
 * 
 * 测试流程：
 * 1. 部署 TestERC777Recipient 合约
 * 2. 向 TestERC777Recipient 合约发送代币
 * 3. 验证回调函数是否被正确调用
 */

const hre = require("hardhat");

async function main() {
    console.log("开始测试 ERC777 回调函数...");
    console.log("当前网络信息:", await hre.ethers.provider.getNetwork());

    // ERC777 代币合约地址
    const TOKEN_ADDRESS = "0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4";
    console.log("代币合约地址:", TOKEN_ADDRESS);

    try {
        // 获取签名者
        const [sender] = await hre.ethers.getSigners();
        console.log("\n测试账户:", sender.address);
        
        // 检查账户余额
        const balance = await hre.ethers.provider.getBalance(sender.address);
        console.log("账户 ETH 余额:", hre.ethers.utils.formatEther(balance));

        // 连接到已部署的 ERC777 合约
        console.log("\n连接到 ERC777 合约...");
        const TestERC777 = await hre.ethers.getContractFactory("TestERC777");
        const token = await TestERC777.attach(TOKEN_ADDRESS);
        console.log("✓ ERC777 合约连接成功");

        // 检查合约代码
        const code = await hre.ethers.provider.getCode(TOKEN_ADDRESS);
        console.log("合约代码长度:", code.length);
        
        // 部署接收者合约
        console.log("\n部署 TestERC777Recipient 合约...");
        const TestERC777Recipient = await hre.ethers.getContractFactory("TestERC777Recipient");
        const recipient = await TestERC777Recipient.deploy({
            gasLimit: 8000000,
            gasPrice: 2000000000
        });
        
        console.log("等待接收者合约部署确认...");
        console.log("交易哈希:", recipient.deployTransaction.hash);
        
        await recipient.deployed();
        console.log("✓ TestERC777Recipient 部署成功:", recipient.address);

        // 查询初始余额
        const initialBalance = await token.balanceOf(sender.address);
        console.log("\n发送者初始余额:", hre.ethers.utils.formatEther(initialBalance), "TEST");

        // 准备发送参数
        const amount = hre.ethers.utils.parseEther("1000"); // 发送 1000 个代币
        const userData = hre.ethers.utils.hexlify(hre.ethers.utils.toUtf8Bytes("测试数据"));
        
        console.log("\n发送代币到接收者合约...");
        console.log("  - 发送数量:", hre.ethers.utils.formatEther(amount), "TEST");
        console.log("  - 用户数据:", hre.ethers.utils.toUtf8String(userData));

        // 发送代币
        const tx = await token.send(recipient.address, amount, userData, {
            gasLimit: 8000000,
            gasPrice: 2000000000
        });
        console.log("  - 交易已发送，等待确认...");
        console.log("  - 交易哈希:", tx.hash);

        // 等待交易确认
        const receipt = await tx.wait();
        console.log("✓ 交易已确认");
        console.log("  - 区块号:", receipt.blockNumber);
        console.log("  - Gas 使用:", receipt.gasUsed.toString());

        // 验证接收者合约的回调数据
        console.log("\n验证回调数据...");
        const lastOperator = await recipient.lastOperator();
        const lastFrom = await recipient.lastFrom();
        const lastAmount = await recipient.lastAmount();
        const lastUserData = await recipient.lastUserData();

        console.log("回调函数接收到的数据:");
        console.log("  - 操作者:", lastOperator);
        console.log("  - 发送者:", lastFrom);
        console.log("  - 数量:", hre.ethers.utils.formatEther(lastAmount), "TEST");
        console.log("  - 用户数据:", hre.ethers.utils.toUtf8String(lastUserData));

        // 验证接收者合约的余额
        const recipientBalance = await token.balanceOf(recipient.address);
        console.log("\n接收者合约最终余额:", hre.ethers.utils.formatEther(recipientBalance), "TEST");

        console.log("\n✓ 测试完成!");

    } catch (error) {
        console.log("\n测试失败!");
        console.log("错误详情:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 