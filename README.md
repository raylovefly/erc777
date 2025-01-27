# DFC Chain ERC777 彩票系统

基于 ERC-777 代币标准实现的去中心化彩票系统，通过普通转账即可完成购票、开奖、奖金分配等所有流程。

## 已部署合约地址

- TestERC777 代币合约: `0x38178ecF255036772c0f1E01fa02F09129e6FB76`
- LotteryERC777 彩票合约: `0xC4fC257200E1aD907Be19fBFE82211c25Da8Ee2D`
- ERC1820Registry: `0xa38BBaD0A6Ad97420F85b7aD0E4B5306ba4F4F19`

## 项目特点

* 无 DApp，纯链上交互：所有操作均通过普通钱包转账触发
* ERC-777 tokensReceived 回调机制：代币转账自动触发智能合约执行相应逻辑
* 无需手动调用合约方法，用户体验与普通代币转账一致
* 完全去中心化，所有逻辑均在智能合约中执行

## 环境要求

- Node.js: v16 或 v18（推荐）
- Hardhat: v2.19.0 或更高版本
- DFC Chain 测试网

## 安装部署

1. 安装依赖
```bash
npm install
```

2. 配置环境变量
```bash
# 编辑 .env 文件
PRIVATE_KEY=你的私钥
RPC_URL=https://node.dragonfly-chain.com
CHAIN_ID=920
GAS_LIMIT=8000000
GAS_PRICE=2000000000  # 2 Gwei
```

3. 编译合约
```bash
npm run compile
```

4. 部署合约
```bash
npm run deploy
```

## 使用说明

### 1. 购买彩票
- 向彩票合约转账 10000.XX 代币
- XX 为两位数字（00-99），作为彩票号码
- 例如：转账 10000.42 代币购买号码为 42 的彩票
- 限制：同一地址 24 小时内只能购买一次

### 2. 开奖
- 向彩票合约转账 100 代币触发开奖
- 合约返回 X.Y 代币
  - X：中奖人数
  - Y：中奖号码
- 例如：返回 3.42 表示有 3 人中奖，中奖号码为 42

### 3. 奖金分配
- 向彩票合约转账 500万代币触发奖金分配
- 合约自动计算每位中奖者应得奖金
- 奖金 = 奖池总额 / 中奖人数
- 分配完成后自动重置彩票状态

## 技术架构

- 智能合约：
  - TestERC777.sol：实现 ERC-777 代币标准
  - LotteryERC777.sol：实现彩票系统逻辑
- 依赖：
  - OpenZeppelin Contracts v4.9.6
  - Hardhat v2.19.4
  - Ethers.js v5.7.2

## Gas 配置

- gasLimit: 8000000（链上限制）
- gasPrice: 2 Gwei (2000000000)

## 注意事项

1. 确保 ERC1820Registry 已在正确地址部署
2. 购票前确保账户有足够的代币余额
3. 开奖前必须有人购买过彩票
4. 分配奖金前必须已完成开奖
5. 合约需要有足够代币支付奖金

## 许可证

MIT
