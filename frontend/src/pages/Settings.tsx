import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setProvider, setSigner } from '../store/slices/ethereumSlice';

interface Settings {
  rpcUrl: string;
  chainId: number;
  autoSave: boolean;
  theme: 'light' | 'dark';
  fontSize: number;
}

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const ethereum = useSelector((state: RootState) => state.ethereum);
  const [settings, setSettings] = useState<Settings>({
    rpcUrl: 'http://localhost:8545',
    chainId: 31337,
    autoSave: true,
    theme: 'dark',
    fontSize: 14,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof Settings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Implement settings save functionality
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleConnectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        dispatch(setProvider(provider));
        dispatch(setSigner(signer));
      } else {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Ethereum Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ethereum Configuration
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RPC URL"
                  value={settings.rpcUrl}
                  onChange={handleChange('rpcUrl')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Chain ID"
                  type="number"
                  value={settings.chainId}
                  onChange={handleChange('chainId')}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleConnectWallet}
                  disabled={ethereum.connected}
                >
                  {ethereum.connected ? 'Connected' : 'Connect Wallet'}
                </Button>
                {ethereum.connected && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Connected Address: {ethereum.address}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Editor Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Editor Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Font Size"
                  type="number"
                  value={settings.fontSize}
                  onChange={handleChange('fontSize')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoSave}
                      onChange={handleChange('autoSave')}
                    />
                  }
                  label="Auto Save"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Theme Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Theme Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.theme === 'dark'}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      theme: e.target.checked ? 'dark' : 'light',
                    }))
                  }
                />
              }
              label="Dark Mode"
            />
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ mt: 2 }}
          >
            Save Settings
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings; 