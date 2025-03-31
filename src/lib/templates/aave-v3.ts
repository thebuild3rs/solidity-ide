import type { FileSystemNode } from '@/lib/types';

export const aaveV3Template: FileSystemNode[] = [
  {
    id: 'contracts',
    name: 'contracts',
    type: 'directory',
    path: '/contracts',
    children: [
      {
        id: 'interfaces',
        name: 'interfaces',
        type: 'directory',
        path: '/contracts/interfaces',
        children: [
          {
            id: 'ILendingPool',
            name: 'ILendingPool.sol',
            type: 'file',
            path: '/contracts/interfaces/ILendingPool.sol',
            extension: '.sol',
            content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILendingPool {
    event Deposit(
        address indexed reserve,
        address user,
        address indexed onBehalfOf,
        uint256 amount,
        uint16 indexed referral
    );

    event Withdraw(
        address indexed reserve,
        address indexed user,
        address indexed to,
        uint256 amount
    );

    event Borrow(
        address indexed reserve,
        address user,
        address indexed onBehalfOf,
        uint256 amount,
        uint256 borrowRateMode,
        uint256 borrowRate,
        uint16 indexed referral
    );

    event Repay(
        address indexed reserve,
        address indexed user,
        address indexed repayer,
        uint256 amount
    );

    event ReserveDataUpdated(
        address indexed reserve,
        uint256 liquidityRate,
        uint256 stableBorrowRate,
        uint256 variableBorrowRate,
        uint256 liquidityIndex,
        uint256 variableBorrowIndex
    );

    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);

    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external;

    function repay(
        address asset,
        uint256 amount,
        uint256 rateMode,
        address onBehalfOf
    ) external returns (uint256);

    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralETH,
            uint256 totalDebtETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
}`
          }
        ]
      },
      {
        id: 'LendingPool',
        name: 'LendingPool.sol',
        type: 'file',
        path: '/contracts/LendingPool.sol',
        extension: '.sol',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ILendingPool.sol";

contract LendingPool is ILendingPool, ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant RISK_ADMIN_ROLE = keccak256("RISK_ADMIN_ROLE");
    
    struct ReserveData {
        uint256 totalDeposits;
        uint256 totalBorrows;
        uint256 liquidityRate;
        uint256 variableBorrowRate;
        uint256 stableBorrowRate;
        uint256 lastUpdateTimestamp;
    }

    struct UserConfigurationMap {
        uint256 data;
    }

    mapping(address => ReserveData) public reserves;
    mapping(address => mapping(address => uint256)) public userDeposits;
    mapping(address => mapping(address => uint256)) public userBorrows;
    mapping(address => UserConfigurationMap) public usersConfig;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(RISK_ADMIN_ROLE, msg.sender);
    }

    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external override nonReentrant whenNotPaused {
        require(amount > 0, "Invalid amount");
        
        ReserveData storage reserve = reserves[asset];
        reserve.totalDeposits += amount;
        userDeposits[asset][onBehalfOf] += amount;

        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        emit Deposit(asset, msg.sender, onBehalfOf, amount, referralCode);
    }

    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external override nonReentrant returns (uint256) {
        require(amount > 0, "Invalid amount");
        
        uint256 userBalance = userDeposits[asset][msg.sender];
        require(userBalance >= amount, "Not enough balance");

        ReserveData storage reserve = reserves[asset];
        reserve.totalDeposits -= amount;
        userDeposits[asset][msg.sender] -= amount;

        IERC20(asset).transfer(to, amount);

        emit Withdraw(asset, msg.sender, to, amount);
        return amount;
    }

    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external override nonReentrant whenNotPaused {
        require(amount > 0, "Invalid amount");
        
        ReserveData storage reserve = reserves[asset];
        reserve.totalBorrows += amount;
        userBorrows[asset][onBehalfOf] += amount;

        IERC20(asset).transfer(msg.sender, amount);

        emit Borrow(
            asset,
            msg.sender,
            onBehalfOf,
            amount,
            interestRateMode,
            reserve.variableBorrowRate,
            referralCode
        );
    }

    function repay(
        address asset,
        uint256 amount,
        uint256 rateMode,
        address onBehalfOf
    ) external override nonReentrant returns (uint256) {
        require(amount > 0, "Invalid amount");
        
        uint256 userDebt = userBorrows[asset][onBehalfOf];
        require(userDebt > 0, "No debt to repay");

        uint256 paybackAmount = amount > userDebt ? userDebt : amount;

        ReserveData storage reserve = reserves[asset];
        reserve.totalBorrows -= paybackAmount;
        userBorrows[asset][onBehalfOf] -= paybackAmount;

        IERC20(asset).transferFrom(msg.sender, address(this), paybackAmount);

        emit Repay(asset, onBehalfOf, msg.sender, paybackAmount);
        return paybackAmount;
    }

    function getUserAccountData(address user)
        external
        view
        override
        returns (
            uint256 totalCollateralETH,
            uint256 totalDebtETH,
            uint256 availableBorrowsETH,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        // Implementation would calculate these values based on oracle prices
        // and user's deposited/borrowed assets
        return (0, 0, 0, 0, 0, 0);
    }

    function pause() external onlyRole(RISK_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(RISK_ADMIN_ROLE) {
        _unpause();
    }
}`
      }
    ]
  }
];