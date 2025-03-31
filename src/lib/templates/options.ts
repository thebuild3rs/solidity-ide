import type { FileSystemNode } from '@/lib/types';

export const optionsTemplate: FileSystemNode[] = [
  {
    id: 'contracts',
    name: 'contracts',
    type: 'directory',
    path: '/contracts',
    children: [
      {
        id: 'EuropeanOption',
        name: 'EuropeanOption.sol',
        type: 'file',
        path: '/contracts/EuropeanOption.sol',
        extension: '.sol',
        content: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

interface IOracle {
    function getPrice(address asset) external view returns (uint256);
}

contract EuropeanOption is ReentrancyGuard, Ownable {
    using Math for uint256;

    struct Option {
        address underlying;
        uint256 strikePrice;
        uint256 expiry;
        bool isCall;
        uint256 premium;
        address writer;
        address holder;
        bool exercised;
    }

    IOracle public oracle;
    IERC20 public collateralToken;
    Option[] public options;
    
    uint256 public constant PREMIUM_DECIMALS = 18;
    uint256 public constant PRICE_DECIMALS = 8;

    event OptionCreated(
        uint256 indexed optionId,
        address indexed writer,
        address underlying,
        uint256 strikePrice,
        uint256 expiry,
        bool isCall,
        uint256 premium
    );
    event OptionPurchased(uint256 indexed optionId, address indexed holder);
    event OptionExercised(uint256 indexed optionId, uint256 profit);
    event OptionExpired(uint256 indexed optionId);

    constructor(address _oracle, address _collateralToken) {
        oracle = IOracle(_oracle);
        collateralToken = IERC20(_collateralToken);
    }

    function createOption(
        address _underlying,
        uint256 _strikePrice,
        uint256 _expiry,
        bool _isCall,
        uint256 _premium
    ) external nonReentrant returns (uint256) {
        require(_expiry > block.timestamp, "Invalid expiry");
        require(_strikePrice > 0, "Invalid strike price");
        require(_premium > 0, "Invalid premium");

        // For call options, writer must deposit collateral equal to underlying asset
        if (_isCall) {
            require(
                collateralToken.transferFrom(msg.sender, address(this), _strikePrice),
                "Collateral transfer failed"
            );
        }

        uint256 optionId = options.length;
        options.push(Option({
            underlying: _underlying,
            strikePrice: _strikePrice,
            expiry: _expiry,
            isCall: _isCall,
            premium: _premium,
            writer: msg.sender,
            holder: address(0),
            exercised: false
        }));

        emit OptionCreated(
            optionId,
            msg.sender,
            _underlying,
            _strikePrice,
            _expiry,
            _isCall,
            _premium
        );

        return optionId;
    }

    function purchaseOption(uint256 _optionId) external nonReentrant {
        Option storage option = options[_optionId];
        require(option.holder == address(0), "Option already purchased");
        require(block.timestamp < option.expiry, "Option expired");

        require(
            collateralToken.transferFrom(msg.sender, option.writer, option.premium),
            "Premium payment failed"
        );

        option.holder = msg.sender;
        emit OptionPurchased(_optionId, msg.sender);
    }

    function exerciseOption(uint256 _optionId) external nonReentrant {
        Option storage option = options[_optionId];
        require(msg.sender == option.holder, "Not option holder");
        require(!option.exercised, "Option already exercised");
        require(block.timestamp < option.expiry, "Option expired");

        uint256 currentPrice = oracle.getPrice(option.underlying);
        uint256 profit;

        if (option.isCall) {
            require(currentPrice > option.strikePrice, "Out of money");
            profit = currentPrice - option.strikePrice;
            require(
                collateralToken.transfer(option.holder, profit),
                "Profit transfer failed"
            );
        } else {
            require(currentPrice < option.strikePrice, "Out of money");
            profit = option.strikePrice - currentPrice;
            require(
                collateralToken.transferFrom(msg.sender, option.writer, currentPrice),
                "Asset transfer failed"
            );
            require(
                collateralToken.transfer(option.holder, option.strikePrice),
                "Strike price transfer failed"
            );
        }

        option.exercised = true;
        emit OptionExercised(_optionId, profit);
    }

    function expireOption(uint256 _optionId) external nonReentrant {
        Option storage option = options[_optionId];
        require(block.timestamp >= option.expiry, "Option not expired");
        require(!option.exercised, "Option already exercised");

        if (option.isCall && option.holder == address(0)) {
            require(
                collateralToken.transfer(option.writer, option.strikePrice),
                "Collateral return failed"
            );
        }

        option.exercised = true;
        emit OptionExpired(_optionId);
    }

    function getOption(uint256 _optionId) external view returns (
        address underlying,
        uint256 strikePrice,
        uint256 expiry,
        bool isCall,
        uint256 premium,
        address writer,
        address holder,
        bool exercised
    ) {
        Option storage option = options[_optionId];
        return (
            option.underlying,
            option.strikePrice,
            option.expiry,
            option.isCall,
            option.premium,
            option.writer,
            option.holder,
            option.exercised
        );
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = IOracle(_oracle);
    }
}`
      }
    ]
  }
];