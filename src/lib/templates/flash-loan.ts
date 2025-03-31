import type { FileSystemNode } from '@/lib/types';

export const flashLoanTemplate: FileSystemNode[] = [
  {
    id: 'contracts',
    name: 'contracts',
    type: 'directory',
    path: '/contracts',
    children: [
      {
        id: 'FlashLoan',
        name: 'FlashLoan.sol',
        type: 'file',
        path: '/contracts/FlashLoan.sol',
        extension: '.sol',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

interface IFlashLoanReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}

contract FlashLoan is ReentrancyGuard, Ownable {
    using Math for uint256;

    uint256 public constant FLASH_LOAN_FEE = 9; // 0.09% fee
    uint256 public constant FEE_PRECISION = 10000;

    mapping(address => uint256) public poolBalance;
    mapping(address => bool) public supportedTokens;

    event FlashLoan(
        address indexed asset,
        address indexed receiver,
        uint256 amount,
        uint256 premium,
        address indexed initiator
    );

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event FeesCollected(address indexed token, uint256 amount);

    constructor() {}

    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function deposit(address token, uint256 amount) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Invalid amount");

        poolBalance[token] += amount;
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
    }

    function withdraw(address token, uint256 amount) external onlyOwner nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Invalid amount");
        require(amount <= poolBalance[token], "Insufficient balance");

        poolBalance[token] -= amount;
        require(
            IERC20(token).transfer(msg.sender, amount),
            "Transfer failed"
        );
    }

    function flashLoan(
        address receiver,
        address token,
        uint256 amount,
        bytes calldata params
    ) external nonReentrant {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Invalid amount");
        require(amount <= poolBalance[token], "Insufficient liquidity");

        uint256 premium = (amount * FLASH_LOAN_FEE) / FEE_PRECISION;
        require(
            IERC20(token).transfer(receiver, amount),
            "Transfer failed"
        );

        require(
            IFlashLoanReceiver(receiver).executeOperation(
                token,
                amount,
                premium,
                msg.sender,
                params
            ),
            "Invalid flash loan executor return"
        );

        require(
            IERC20(token).transferFrom(
                receiver,
                address(this),
                amount + premium
            ),
            "Repay failed"
        );

        poolBalance[token] += premium;

        emit FlashLoan(token, receiver, amount, premium, msg.sender);
    }

    function collectFees(address token) external onlyOwner nonReentrant {
        require(supportedTokens[token], "Token not supported");
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > poolBalance[token], "No fees to collect");

        uint256 fees = balance - poolBalance[token];
        require(
            IERC20(token).transfer(owner(), fees),
            "Fee transfer failed"
        );

        emit FeesCollected(token, fees);
    }

    function getPoolBalance(address token) external view returns (uint256) {
        return poolBalance[token];
    }
}`
      },
      {
        id: 'FlashLoanReceiver',
        name: 'FlashLoanReceiver.sol',
        type: 'file',
        path: '/contracts/FlashLoanReceiver.sol',
        extension: '.sol',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlashLoanReceiver is Ownable {
    event ReceivedFlashLoan(
        address indexed asset,
        uint256 amount,
        uint256 premium,
        address indexed initiator
    );

    // This function is called after your contract has received the flash loaned amount
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        // Your custom flash loan logic goes here
        // For example: arbitrage, liquidation, etc.

        // Approve repayment
        uint256 amountToRepay = amount + premium;
        require(
            IERC20(asset).approve(msg.sender, amountToRepay),
            "Repayment approval failed"
        );

        emit ReceivedFlashLoan(asset, amount, premium, initiator);
        return true;
    }

    // Function to recover any tokens sent to this contract
    function recoverToken(address token, uint256 amount) external onlyOwner {
        require(
            IERC20(token).transfer(owner(), amount),
            "Token recovery failed"
        );
    }
}`
      }
    ]
  }
];