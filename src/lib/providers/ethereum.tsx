import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

interface EthereumContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const EthereumContext = createContext<EthereumContextType>({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
});

export function EthereumProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  const connect = async () => {
    try {
      if (!provider) {
        throw new Error('No provider available');
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setAddress(accounts[0]);
      setSigner(signer);
      setChainId(Number(network.chainId));

      toast({
        title: 'Connected',
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to wallet',
        variant: 'destructive',
      });
    }
  };

  const disconnect = () => {
    setAddress(null);
    setSigner(null);
    setChainId(null);
  };

  return (
    <EthereumContext.Provider
      value={{
        provider,
        signer,
        address,
        chainId,
        connect,
        disconnect,
      }}
    >
      {children}
    </EthereumContext.Provider>
  );
}

export const useEthereum = () => useContext(EthereumContext); 