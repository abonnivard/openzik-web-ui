import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Storage as ServerIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  MusicNote as MusicIcon
} from '@mui/icons-material';

import configService from '../services/configService';

const ServerSetup = ({ onComplete }) => {
  const [serverUrl, setServerUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [error, setError] = useState('');

  const handleServerUrlChange = (e) => {
    setServerUrl(e.target.value);
    setConnectionStatus(null);
    setError('');
  };

  const testConnection = async () => {
    if (!serverUrl.trim()) {
      setError('Please enter a server URL');
      return;
    }

    setIsConnecting(true);
    setError('');
    setConnectionStatus(null);

    try {
      const result = await configService.testConnection(serverUrl.trim());
      
      if (result.success) {
        setConnectionStatus('success');
        // Sauvegarder automatiquement après test réussi
        configService.setServerUrl(serverUrl.trim());
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setConnectionStatus('error');
        setError(result.message);
      }
    } catch (error) {
      setConnectionStatus('error');
      setError(error.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      testConnection();
    }
  };

  const getPlaceholderUrl = () => {
    // Suggestions d'URL selon la plateforme
    if (window.location.hostname === 'localhost') {
      return 'http://192.168.1.100:3000';
    }
    return 'https://your-server.com';
  };

  return (
    <Box maxWidth="sm" sx={{ mx: 'auto' }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#121212',
          py: 4,
          px: 2
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            bgcolor: '#1a1a1a',
            borderRadius: 3,
            border: '1px solid #333',
            width: '100%',
            maxWidth: 480
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                bgcolor: '#1db954',
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2
              }}
            >
              <MusicIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
              Welcome to Music App
            </Typography>
            <Typography variant="body1" sx={{ color: '#b3b3b3' }}>
              Connect to your music server to get started
            </Typography>
          </Box>

          {/* Server URL Input */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#fff', mb: 2, fontWeight: 500 }}>
              Server Configuration
            </Typography>
            
            <TextField
              fullWidth
              label="Server URL"
              placeholder={getPlaceholderUrl()}
              value={serverUrl}
              onChange={handleServerUrlChange}
              onKeyPress={handleKeyPress}
              disabled={isConnecting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ServerIcon sx={{ color: '#b3b3b3' }} />
                  </InputAdornment>
                ),
                endAdornment: connectionStatus && (
                  <InputAdornment position="end">
                    {connectionStatus === 'success' ? (
                      <CheckIcon sx={{ color: '#1db954' }} />
                    ) : connectionStatus === 'error' ? (
                      <ErrorIcon sx={{ color: '#ff6b6b' }} />
                    ) : null}
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#121212',
                  color: '#fff',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#555' },
                  '&.Mui-focused fieldset': { borderColor: '#1db954' },
                },
                '& .MuiInputLabel-root': { color: '#b3b3b3' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1db954' },
              }}
            />

            <Typography variant="caption" sx={{ color: '#b3b3b3', mt: 1, display: 'block' }}>
              Enter the URL of your music server (e.g., http://192.168.1.100:3000)
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(255,107,107,0.1)',
                border: '1px solid rgba(255,107,107,0.3)',
                color: '#fff',
                '& .MuiAlert-icon': { color: '#ff6b6b' }
              }}
            >
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {connectionStatus === 'success' && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(29,185,84,0.1)',
                border: '1px solid rgba(29,185,84,0.3)',
                color: '#fff',
                '& .MuiAlert-icon': { color: '#1db954' }
              }}
            >
              Connected successfully! Redirecting...
            </Alert>
          )}

          {/* Connect Button */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={testConnection}
            disabled={isConnecting || !serverUrl.trim()}
            startIcon={isConnecting ? <CircularProgress size={20} /> : <ServerIcon />}
            sx={{
              bgcolor: '#1db954',
              color: 'white',
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: '#1ed760' },
              '&:disabled': { 
                bgcolor: '#333', 
                color: '#666' 
              }
            }}
          >
            {isConnecting ? 'Testing Connection...' : 'Connect to Server'}
          </Button>

          {/* Info */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#666' }}>
              This configuration will be saved on your device
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ServerSetup;
