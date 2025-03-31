// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InterestRateModel is Ownable {
    uint256 private constant BASE_RATE = 200; // 2%
    uint256 private constant SLOPE1 = 1000; // 10%
    uint256 private constant SLOPE2 = 3000; // 30%
    uint256 private constant OPTIMAL_UTILIZATION = 8000; // 80%
    
    event ParametersUpdated(
        uint256 baseRate,
        uint256 slope1,
        uint256 slope2,
        uint256 optimalUtilization
    );
    
    function calculateBorrowRate(
        uint256 totalSupply,
        uint256 totalBorrow
    ) public pure returns (uint256) {
        if (totalSupply == 0) return BASE_RATE;
        
        uint256 utilization = (totalBorrow * 10000) / totalSupply;
        
        if (utilization <= OPTIMAL_UTILIZATION) {
            return BASE_RATE + (utilization * SLOPE1) / OPTIMAL_UTILIZATION;
        } else {
            uint256 excessUtilization = utilization - OPTIMAL_UTILIZATION;
            return BASE_RATE + SLOPE1 + (excessUtilization * SLOPE2) / (10000 - OPTIMAL_UTILIZATION);
        }
    }
    
    function calculateSupplyRate(
        uint256 totalSupply,
        uint256 totalBorrow,
        uint256 reserveFactor
    ) public pure returns (uint256) {
        if (totalSupply == 0) return 0;
        
        uint256 borrowRate = calculateBorrowRate(totalSupply, totalBorrow);
        uint256 utilization = (totalBorrow * 10000) / totalSupply;
        
        return (borrowRate * utilization * (10000 - reserveFactor)) / (10000 * 10000);
    }
    
    function updateParameters(
        uint256 _baseRate,
        uint256 _slope1,
        uint256 _slope2,
        uint256 _optimalUtilization
    ) external onlyOwner {
        require(_baseRate <= 1000, "InterestRateModel: Invalid base rate");
        require(_slope1 <= 5000, "InterestRateModel: Invalid slope1");
        require(_slope2 <= 10000, "InterestRateModel: Invalid slope2");
        require(_optimalUtilization <= 10000, "InterestRateModel: Invalid optimal utilization");
        
        emit ParametersUpdated(_baseRate, _slope1, _slope2, _optimalUtilization);
    }
} 