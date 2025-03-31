import { Router, Request, Response } from 'express';
import { EthereumService } from '../services/ethereum.service';
import { logger } from '../utils/logger';

const router = Router();
const ethereumService = new EthereumService(
  process.env.ETHEREUM_RPC_URL || 'http://localhost:8545',
  process.env.ETHEREUM_NETWORK || 'localhost'
);

// Connect wallet
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { privateKey } = req.body;
    if (!privateKey) {
      return res.status(400).json({ error: 'Private key is required' });
    }

    await ethereumService.connectWallet(privateKey);
    res.json({ message: 'Wallet connected successfully' });
  } catch (error) {
    logger.error('Failed to connect wallet', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// Get balance
router.get('/balance/:address', async (req: Request<{ address: string }>, res: Response) => {
  try {
    const balance = await ethereumService.getBalance(req.params.address);
    res.json({ balance });
  } catch (error) {
    logger.error('Failed to get balance', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Compile contract
router.post('/compile', async (req: Request, res: Response) => {
  try {
    const { source } = req.body;
    if (!source) {
      return res.status(400).json({ error: 'Contract source is required' });
    }

    const result = await ethereumService.compileContract(source);
    res.json(result);
  } catch (error) {
    logger.error('Failed to compile contract', error);
    res.status(500).json({ error: 'Failed to compile contract' });
  }
});

// Deploy contract
router.post('/deploy', async (req: Request, res: Response) => {
  try {
    const { bytecode, abi, args } = req.body;
    if (!bytecode || !abi) {
      return res.status(400).json({ error: 'Bytecode and ABI are required' });
    }

    const address = await ethereumService.deployContract(bytecode, abi, args || []);
    res.json({ address });
  } catch (error) {
    logger.error('Failed to deploy contract', error);
    res.status(500).json({ error: 'Failed to deploy contract' });
  }
});

// Interact with contract
router.post('/interact', async (req: Request, res: Response) => {
  try {
    const { address, abi, method, args } = req.body;
    if (!address || !abi || !method) {
      return res.status(400).json({ error: 'Address, ABI, and method are required' });
    }

    const result = await ethereumService.interactWithContract(address, abi, method, args || []);
    res.json({ result });
  } catch (error) {
    logger.error('Failed to interact with contract', error);
    res.status(500).json({ error: 'Failed to interact with contract' });
  }
});

// Get transaction receipt
router.get('/receipt/:txHash', async (req: Request<{ txHash: string }>, res: Response) => {
  try {
    const receipt = await ethereumService.getTransactionReceipt(req.params.txHash);
    res.json({ receipt });
  } catch (error) {
    logger.error('Failed to get transaction receipt', error);
    res.status(500).json({ error: 'Failed to get transaction receipt' });
  }
});

// Estimate gas
router.post('/estimate-gas', async (req: Request, res: Response) => {
  try {
    const { to, value, data } = req.body;
    if (!to || !data) {
      return res.status(400).json({ error: 'To address and data are required' });
    }

    const gasEstimate = await ethereumService.estimateGas(
      to,
      BigInt(value || 0),
      data
    );
    res.json({ gasEstimate: gasEstimate.toString() });
  } catch (error) {
    logger.error('Failed to estimate gas', error);
    res.status(500).json({ error: 'Failed to estimate gas' });
  }
});

// Get network info
router.get('/network', async (req: Request, res: Response) => {
  try {
    const network = await ethereumService.getNetwork();
    res.json({ network });
  } catch (error) {
    logger.error('Failed to get network info', error);
    res.status(500).json({ error: 'Failed to get network info' });
  }
});

export default router; 