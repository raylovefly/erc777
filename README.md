# DFC Chain ERC777 彩票系统

基于 ERC-777 代币标准实现的去中心化彩票系统，通过普通转账即可完成购票、开奖、奖金分配等所有流程。

## 已部署合约地址

- TestERC777 代币合约: `0x5eb1e04D71D5ACD30e946029339E7CE554024Cf4`
- LotteryERC777 彩票合约: `0x976E50489b0E11EA619188c221325E36438fB4e5`
- ERC1820Registry: `0xa38BBaD0A6Ad97420F85b7aD0E4B5306ba4F4F19`

## 项目特点

* 无 DApp，纯链上交互：所有操作均通过普通钱包转账触发
* ERC-777 tokensReceived 回调机制：代币转账自动触发智能合约执行相应逻辑
* 无需手动调用合约方法，用户体验与普通代币转账一致
* 完全去中心化，所有逻辑均在智能合约中执行
* 使用区块哈希作为随机源，保证开奖公平性

## 环境要求

- Node.js: v16 或 v18（推荐）
- Hardhat: v2.19.0 或更高版本
- DFC Chain 测试网

## 开发环境搭建

1. 克隆项目
```bash
git clone https://github.com/raylovefly/erc777.git
cd erc777
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
# 创建 .env 文件并配置以下变量
PRIVATE_KEY=你的私钥
RPC_URL=https://node.dragonfly-chain.com
CHAIN_ID=920
GAS_LIMIT=8000000
GAS_PRICE=2000000000  # 2 Gwei
```

4. 编译合约
```bash
npx hardhat compile
```

5. 运行测试
```bash
npx hardhat test
```

6. 部署合约
```bash
npx hardhat run scripts/deploy.js --network dfc
```

## 合约架构

### TestERC777.sol
- 实现 ERC-777 代币标准
- 继承 OpenZeppelin 的 ERC777 合约
- 添加了自定义的转账逻辑
- 支持 ERC20 兼容性

主要函数：
```solidity
// 构造函数：初始化代币信息
constructor(
    string memory name,
    string memory symbol,
    address[] memory defaultOperators
)

// 发送代币（ERC777标准）
function send(
    address recipient,
    uint256 amount,
    bytes memory data
) public virtual override

// 转账代币（ERC20兼容）
function transfer(
    address recipient,
    uint256 amount
) public virtual override returns (bool)
```

### LotteryERC777.sol
- 实现彩票系统核心逻辑
- 实现 IERC777Recipient 接口
- 使用 ERC1820 标准注册接口

主要数据结构：
```solidity
struct Ticket {
    address buyer;      // 购买者地址
    uint8 number;       // 彩票号码
    uint256 timestamp; // 购买时间
}

Ticket[] public tickets;           // 彩票列表
uint8 public winningNumber;        // 中奖号码
uint256 public winnerCount;        // 中奖人数
bool public isDrawn;               // 是否已开奖
mapping(address => uint256) public lastPurchaseTime; // 上次购买时间
```

主要函数：
```solidity
// 接收代币时的回调函数
function tokensReceived(
    address operator,
    address from,
    address to,
    uint256 amount,
    bytes calldata userData,
    bytes calldata operatorData
) external override

// 内部函数：处理彩票购买
function _handleTicketPurchase(
    address buyer,
    uint8 number
) internal

// 内部函数：处理开奖
function _handleLotteryDraw() internal

// 内部函数：处理奖金分配
function _handlePrizeDistribution() internal
```

## 操作命令

### 1. 检查环境
```bash
npx hardhat run scripts/utils-check-env.js --network dfc
```

### 2. 部署合约
```bash
# 部署代币合约
npx hardhat run scripts/deploy-token.js --network dfc

# 部署彩票合约
npx hardhat run scripts/deploy-contracts.js --network dfc
```

### 3. 创建测试账户
```bash
npx hardhat run scripts/utils-create-wallets.js --network dfc
```

### 4. 批量转账测试
```bash
npx hardhat run scripts/test-batch-transfer.js --network dfc
```

### 5. 购买彩票测试
```bash
# 单笔购买测试
npx hardhat run scripts/test-single-lottery.js --network dfc

# 批量购买测试
npx hardhat run scripts/test-batch-buy-lottery.js --network dfc
```

### 6. 开奖和分配奖金
```bash
# 开奖
npx hardhat run scripts/test-draw-lottery.js --network dfc

# 分配奖金
npx hardhat run scripts/test-distribute-rewards.js --network dfc
```

### 7. 监控系统状态
```bash
# 查看当前状态
npx hardhat run scripts/check-lottery-status.js --network dfc

# 实时监控事件
npx hardhat run scripts/monitor-events.js --network dfc
```

## 交互流程

1. 购买彩票
   - 转账金额：10000.XX TEST（XX为00-99的两位数字）
   - 示例：转账10000.42 TEST购买42号彩票
   - 限制：同一地址24小时内只能购买一次

2. 开奖流程
   - 转账金额：100 TEST
   - 合约自动使用区块哈希生成随机数
   - 遍历所有彩票统计中奖人数
   - 触发LotteryDrawn事件

3. 奖金分配
   - 转账金额：5000000 TEST（500万）
   - 自动计算每人奖金：奖池总额/中奖人数
   - 自动向中奖者发送奖金
   - 重置彩票状态

## 事件监听

主要事件：
```solidity
event TicketPurchased(address buyer, uint8 number);
event LotteryDrawn(uint8 winningNumber, uint256 winnerCount);
event PrizesDistributed(uint256 prizePerWinner);
```

监听示例：
```javascript
lottery.on("TicketPurchased", (buyer, number) => {
    console.log(`新彩票购买: ${buyer} 购买号码 ${number}`);
});

lottery.on("LotteryDrawn", (winningNumber, winnerCount) => {
    console.log(`开奖结果: 中奖号码=${winningNumber}, 中奖人数=${winnerCount}`);
});
```

## 安全考虑

1. 随机数生成
   - 使用区块哈希作为随机源
   - 开奖交易的前一个区块哈希
   - 无法预测，保证公平性

2. 访问控制
   - 购买限制：24小时冷却期
   - 开奖条件：必须有人购买过彩票
   - 分配条件：必须已开奖且有中奖者

3. 代币安全
   - 使用 OpenZeppelin 合约库
   - ERC777 标准的安全特性
   - 回调函数的重入保护

## 测试覆盖

1. 单元测试
```bash
npx hardhat test test/lottery.test.js
```

2. 集成测试
```bash
npx hardhat test test/integration.test.js
```

3. 测试网部署
```bash
npx hardhat run scripts/deploy.js --network dfc
```

## 常见问题

1. 交易失败
   - 检查代币余额是否充足
   - 确认是否在冷却期内
   - 验证转账金额格式是否正确

2. 开奖失败
   - 确认是否有人购买过彩票
   - 检查转账金额是否正确
   - 确认是否已经开过奖

3. 分配失败
   - 确认是否已开奖
   - 检查是否有中奖者
   - 验证合约代币余额是否充足

## 许可证

MIT

