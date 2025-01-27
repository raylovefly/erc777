/**
 * ERC777 代币部署脚本
 * 
 * 环境要求：
 * - Node.js 版本: 推荐使用 v16 或 v18，v23.6.0 可能会有兼容性警告
 * - Hardhat: v2.19.0 或更高版本
 * 
 * 依赖说明：
 * - @openzeppelin/contracts: v4.9.0 或更高版本
 * - 需要预先部署 ERC1820Registry 合约
 * 
 * 网络配置：
 * - 网络: DFC Chain
 * - Chain ID: 920
 * - RPC URL: https://node.dragonfly-chain.com
 * 
 * Gas 配置说明：
 * - gasLimit: 8000000 (链上限制为 8000000)
 * - gasPrice: 2 Gwei (2000000000)
 * 
 * 常见失败原因：
 * 1. ERC1820Registry 地址错误或未部署
 * 2. Gas 限制超过链上限制 (8000000)
 * 3. 账户余额不足支付 Gas
 * 4. Node.js 版本不兼容导致的警告
 * 5. 网络连接不稳定
 * 
 * 重要提示：
 * 1. 确保 ERC1820Registry 已在正确地址部署: 0xa38BBaD0A6Ad97420F85b7aD0E4B5306ba4F4F19
 * 2. 不要使用 OpenZeppelin 原版 ERC777，因其硬编码了错误的 ERC1820Registry 地址
 * 3. 使用自定义的 CustomERC777 合约以支持正确的 ERC1820Registry 地址
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 部署 TestERC777
  const initialSupply = ethers.utils.parseEther("100000000000"); // 1000亿代币
  const defaultOperators = [deployer.address]; // 设置部署者为操作者

  const TestERC777 = await ethers.getContractFactory("TestERC777");
  const token = await TestERC777.deploy(initialSupply, defaultOperators);
  await token.deployed();

  console.log("TestERC777 deployed to:", token.address);
  console.log("Initial supply:", ethers.utils.formatEther(initialSupply));
  console.log("Default operator:", defaultOperators[0]);

  // 部署 LotteryERC777
  const LotteryERC777 = await ethers.getContractFactory("LotteryERC777");
  const lottery = await LotteryERC777.deploy(token.address);
  await lottery.deployed();

  console.log("LotteryERC777 deployed to:", lottery.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 