// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRiskParams {
    function getHealthFactorThreshold() external pure returns (uint256);
    function getLiquidationBonus() external pure returns (uint256);
    function getCollateralFactor(address asset) external view returns (uint256);
    function setCollateralFactor(address asset, uint256 newFactor) external;
} 