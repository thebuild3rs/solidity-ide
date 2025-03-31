import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

interface EthereumState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: EthereumState = {
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  balance: null,
  connected: false,
  loading: false,
  error: null,
};

const ethereumSlice = createSlice({
  name: 'ethereum',
  initialState,
  reducers: {
    setProvider: (state, action: PayloadAction<ethers.BrowserProvider | null>) => {
      state.provider = action.payload;
    },
    setSigner: (state, action: PayloadAction<ethers.JsonRpcSigner | null>) => {
      state.signer = action.payload;
    },
    setAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
    },
    setChainId: (state, action: PayloadAction<number | null>) => {
      state.chainId = action.payload;
    },
    setBalance: (state, action: PayloadAction<string | null>) => {
      state.balance = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetState: (state) => {
      state.provider = null;
      state.signer = null;
      state.address = null;
      state.chainId = null;
      state.balance = null;
      state.connected = false;
      state.error = null;
    },
  },
});

export const {
  setProvider,
  setSigner,
  setAddress,
  setChainId,
  setBalance,
  setConnected,
  setLoading,
  setError,
  resetState,
} = ethereumSlice.actions;

export default ethereumSlice.reducer; 