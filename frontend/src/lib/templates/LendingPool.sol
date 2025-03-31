// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IRiskParams.sol";

contract LendingPool is Ownable {
    using SafeERC20 for IERC20;
    
    IRiskParams public immutable riskParams;
    
    mapping(address => uint256) public totalSupply;
    mapping(address => mapping(address => uint256)) public userSupply;
    mapping(address => uint256) public totalBorrow;
    mapping(address => mapping(address => uint256)) public userBorrow;
    
    event Deposit(address indexed asset, address indexed user, uint256 amount);
    event Withdraw(address indexed asset, address indexed user, uint256 amount);
    event Borrow(address indexed asset, address indexed user, uint256 amount);
    event Repay(address indexed asset, address indexed user, uint256 amount);
    event Liquidate(address indexed asset, address indexed user, uint256 amount);
    
    constructor(address _riskParams) {
        riskParams = IRiskParams(_riskParams);
    }
    
    function deposit(address asset, uint256 amount) external {
        require(amount > 0, "LendingPool: Amount must be greater than 0");
        
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        
        totalSupply[asset] += amount;
        userSupply[asset][msg.sender] += amount;
        
        emit Deposit(asset, msg.sender, amount);
    }
    
    function withdraw(address asset, uint256 amount) external {
        require(amount > 0, "LendingPool: Amount must be greater than 0");
        require(userSupply[asset][msg.sender] >= amount, "LendingPool: Insufficient balance");
        
        totalSupply[asset] -= amount;
        userSupply[asset][msg.sender] -= amount;
        
        IERC20(asset).safeTransfer(msg.sender, amount);
        
        emit Withdraw(asset, msg.sender, amount);
    }
    
    function borrow(address asset, uint256 amount) external {
        require(amount > 0, "LendingPool: Amount must be greater than 0");
        
        uint256 collateralFactor = riskParams.getCollateralFactor(asset);
        require(
            userSupply[asset][msg.sender] * collateralFactor >= (userBorrow[asset][msg.sender] + amount) * 1e18,
            "LendingPool: Insufficient collateral"
        );
        
        totalBorrow[asset] += amount;
        userBorrow[asset][msg.sender] += amount;
        
        IERC20(asset).safeTransfer(msg.sender, amount);
        
        emit Borrow(asset, msg.sender, amount);
    }
    
    function repay(address asset, uint256 amount) external {
        require(amount > 0, "LendingPool: Amount must be greater than 0");
        require(userBorrow[asset][msg.sender] >= amount, "LendingPool: Insufficient debt");
        
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        
        totalBorrow[asset] -= amount;
        userBorrow[asset][msg.sender] -= amount;
        
        emit Repay(asset, msg.sender, amount);
    }
    
    function liquidate(address asset, address user) external {
        uint256 healthFactor = calculateHealthFactor(asset, user);
        require(healthFactor < riskParams.getHealthFactorThreshold(), "LendingPool: Position is healthy");
        
        uint256 debt = userBorrow[asset][user];
        uint256 collateral = userSupply[asset][user];
        uint256 liquidationBonus = riskParams.getLiquidationBonus();
        
        // Transfer collateral to liquidator with bonus
        uint256 liquidatorAmount = collateral * liquidationBonus / 10000;
        userSupply[asset][user] -= collateral;
        userSupply[asset][msg.sender] += liquidatorAmount;
        
        // Repay debt
        IERC20(asset).safeTransferFrom(msg.sender, address(this), debt);
        userBorrow[asset][user] = 0;
        totalBorrow[asset] -= debt;
        
        emit Liquidate(asset, user, debt);
    }
    
    function calculateHealthFactor(address asset, address user) public view returns (uint256) {
        uint256 collateral = userSupply[asset][user];
        uint256 debt = userBorrow[asset][user];
        uint256 collateralFactor = riskParams.getCollateralFactor(asset);
        
        if (debt == 0) return type(uint256).max;
        return (collateral * collateralFactor) / (debt * 1e18);
    }
} 