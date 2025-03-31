import { ProtocolTemplate } from '../types';

const AAVE_V3_REPO = 'https://raw.githubusercontent.com/aave/aave-v3-core/master';

const aaveV3Template: ProtocolTemplate = {
  name: 'Aave V3',
  description: 'Aave V3 is a decentralized non-custodial liquidity markets protocol where users can participate as suppliers or borrowers.',
  version: '3.0.1',
  files: [
    {
      name: 'Pool.sol',
      path: 'contracts/protocol/pool/Pool.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/pool/Pool.sol`
    },
    {
      name: 'PoolConfigurator.sol', 
      path: 'contracts/protocol/pool/PoolConfigurator.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/pool/PoolConfigurator.sol`
    },
    {
      name: 'DefaultReserveInterestRateStrategy.sol',
      path: 'contracts/protocol/pool/DefaultReserveInterestRateStrategy.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/pool/DefaultReserveInterestRateStrategy.sol`
    },
    {
      name: 'PoolAddressesProvider.sol',
      path: 'contracts/protocol/configuration/PoolAddressesProvider.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/configuration/PoolAddressesProvider.sol`
    },
    {
      name: 'AToken.sol',
      path: 'contracts/protocol/tokenization/AToken.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/tokenization/AToken.sol`
    },
    {
      name: 'StableDebtToken.sol',
      path: 'contracts/protocol/tokenization/StableDebtToken.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/tokenization/StableDebtToken.sol`
    },
    {
      name: 'VariableDebtToken.sol',
      path: 'contracts/protocol/tokenization/VariableDebtToken.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/tokenization/VariableDebtToken.sol`
    },
    {
      name: 'DataTypes.sol',
      path: 'contracts/protocol/libraries/types/DataTypes.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/libraries/types/DataTypes.sol`
    },
    {
      name: 'ReserveConfiguration.sol',
      path: 'contracts/protocol/libraries/configuration/ReserveConfiguration.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/libraries/configuration/ReserveConfiguration.sol`
    },
    {
      name: 'UserConfiguration.sol',
      path: 'contracts/protocol/libraries/configuration/UserConfiguration.sol',
      content: `${AAVE_V3_REPO}/contracts/protocol/libraries/configuration/UserConfiguration.sol`
    }
  ]
};

export default aaveV3Template; 