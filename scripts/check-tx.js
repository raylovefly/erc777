const { ethers } = require("hardhat");

async function main() {
    // 要检查的交易哈希
    const txHash = "0x9a54770c2dc8b31b2cf65cd2a8c5737c1766ee6b5200f994fa728e0c32c04fb6";
    
    try {
        console.log(`\n正在查询交易: ${txHash}`);
        
        // 获取交易详情
        const tx = await ethers.provider.getTransaction(txHash);
        if (!tx) {
            console.error("❌ 未找到该交易");
            process.exit(1);
        }

        // 获取交易收据
        const receipt = await ethers.provider.getTransactionReceipt(txHash);
        
        // 获取区块信息
        const block = await ethers.provider.getBlock(tx.blockNumber);
        
        // 打印交易基本信息
        console.log("\n========== 交易基本信息 ==========");
        console.log(`状态: ${receipt.status ? '✅ 成功' : '❌ 失败'}`);
        console.log(`区块号: ${tx.blockNumber}`);
        console.log(`时间戳: ${new Date(block.timestamp * 1000).toLocaleString()}`);
        console.log(`发送方: ${tx.from}`);
        console.log(`接收方: ${tx.to}`);
        console.log(`交易值: ${ethers.utils.formatEther(tx.value)} ETH`);
        console.log(`Gas价格: ${ethers.utils.formatUnits(tx.gasPrice, "gwei")} Gwei`);
        console.log(`Gas限制: ${tx.gasLimit.toString()}`);
        console.log(`Gas使用: ${receipt.gasUsed.toString()}`);
        console.log(`Nonce: ${tx.nonce}`);

        // 解析交易输入数据
        console.log("\n========== 交易输入数据 ==========");
        const iface = new ethers.utils.Interface([
            "function transfer(address to, uint256 amount) returns (bool)",
            "function send(address recipient, uint256 amount, bytes data)",
            "event Sent(address indexed operator, address indexed from, address indexed to, uint256 amount, bytes data, bytes operatorData)",
            "event TicketPurchased(address buyer, uint8 number)",
            "event Transfer(address indexed from, address indexed to, uint256 value)",
            "event LotteryDrawn(uint8 winningNumber, uint256 winnerCount)"
        ]);

        try {
            const decodedInput = iface.parseTransaction({ data: tx.data });
            console.log("函数名称:", decodedInput.name);
            console.log("函数参数:");
            for (const [key, value] of Object.entries(decodedInput.args)) {
                if (typeof value === 'string' && ethers.utils.isAddress(value)) {
                    console.log(`  ${key}: ${value}`);
                } else if (ethers.BigNumber.isBigNumber(value)) {
                    console.log(`  ${key}: ${ethers.utils.formatEther(value)} TEST`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }
        } catch (error) {
            console.log("无法解码交易输入数据:", error.message);
        }
        
        // 打印事件日志
        if (receipt.logs && receipt.logs.length > 0) {
            console.log("\n========== 事件日志 ==========");
            for (let i = 0; i < receipt.logs.length; i++) {
                const log = receipt.logs[i];
                console.log(`\n事件 #${i + 1}:`);
                console.log(`合约地址: ${log.address}`);
                
                try {
                    const decodedLog = iface.parseLog(log);
                    console.log("事件名称:", decodedLog.name);
                    console.log("事件参数:");
                    for (const [key, value] of Object.entries(decodedLog.args)) {
                        if (typeof value === 'string' && ethers.utils.isAddress(value)) {
                            console.log(`  ${key}: ${value}`);
                        } else if (ethers.BigNumber.isBigNumber(value)) {
                            console.log(`  ${key}: ${ethers.utils.formatEther(value)} TEST`);
                        } else {
                            console.log(`  ${key}: ${value}`);
                        }
                    }
                } catch (error) {
                    console.log("主题:");
                    log.topics.forEach((topic, index) => {
                        console.log(`  ${index}: ${topic}`);
                    });
                    console.log("数据:", log.data);
                }
            }
        }
        
        // 如果交易失败，尝试复现错误
        if (!receipt.status) {
            console.log("\n========== 错误信息 ==========");
            try {
                await ethers.provider.call(tx, tx.blockNumber);
            } catch (error) {
                console.log("错误原因:", error.message);
            }
        }
        
    } catch (error) {
        console.error("\n❌ 查询失败:");
        console.error(error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("脚本执行失败:", error);
        process.exit(1);
    }); 