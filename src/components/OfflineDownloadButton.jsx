import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Tooltip, 
  CircularProgress, 
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

import { hasOfflineSupport } from '../utils/platform';
import offlineDownloadService from '../services/offlineDownload';

const OfflineDownloadButton = ({ track, size = 'medium', compact = false }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Check if track is already offline
    setIsOffline(offlineDownloadService.isTrackOffline(track.id));

    // Check if currently downloading
    const progress = offlineDownloadService.getDownloadProgress(track.id);
    if (progress) {
      setIsDownloading(true);
      setDownloadProgress(progress.progress);
    }
  }, [track.id]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDownload = async () => {
    if (!hasOfflineSupport()) {
      showSnackbar('Offline downloads only available on mobile app', 'warning');
      return;
    }

    if (isDownloading || isOffline) return;

    try {
      console.log('Starting download for track:', track.id, track.title);
      setIsDownloading(true);
      setDownloadProgress(0);

      await offlineDownloadService.downloadTrack(track, (progress) => {
        console.log('Download progress:', progress);
        setDownloadProgress(progress);
      });

      console.log('Download completed successfully');
      setIsOffline(true);
      setIsDownloading(false);
      showSnackbar('Track downloaded for offline listening!', 'success');

    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      showSnackbar(error.message || 'Download failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!isOffline) return;

    try {
      const success = await offlineDownloadService.deleteOfflineTrack(track.id);
      if (success) {
        setIsOffline(false);
        showSnackbar('Offline track deleted', 'info');
      } else {
        showSnackbar('Failed to delete offline track', 'error');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showSnackbar('Failed to delete offline track', 'error');
    }
  };

  // Don't show on web platform
  if (!hasOfflineSupport()) {
    return null;
  }

  const buttonSize = compact ? 'small' : (size === 'small' ? 'small' : 'medium');
  const iconSize = compact ? 'small' : (size === 'small' ? 'small' : 'medium');

  return (
    <>
      <Box position="relative" display="inline-flex">
        {isDownloading ? (
          <Tooltip title={`Downloading... ${Math.round(downloadProgress)}%`}>
            <Box position="relative" display="inline-flex">
              <CircularProgress 
                size={compact ? 20 : (size === 'small' ? 24 : 32)}
                variant="determinate" 
                value={downloadProgress}
                sx={{
                  color: '#1db954',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }}
              />
              <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <DownloadIcon 
                  fontSize={compact ? 'inherit' : (size === 'small' ? 'inherit' : 'small')} 
                  sx={{ color: '#1db954', fontSize: compact ? '10px' : (size === 'small' ? '12px' : '16px') }}
                />
              </Box>
            </Box>
          </Tooltip>
        ) : isOffline ? (
          <Tooltip title="Downloaded • Tap to remove">
            <IconButton 
              onClick={handleDelete}
              size={buttonSize}
              sx={{
                color: '#1db954',
                '&:hover': {
                  color: '#ff6b6b',
                  bgcolor: 'rgba(255,107,107,0.08)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease',
                padding: compact ? "2px" : "6px",
                minWidth: compact ? "24px" : "32px",
                minHeight: compact ? "24px" : "32px",
                "& .MuiSvgIcon-root": {
                  fontSize: compact ? "0.9rem" : "1.1rem"
                }
              }}
            >
              <CheckCircleIcon fontSize={iconSize} />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Download for offline">
            <IconButton 
              onClick={handleDownload}
              size={buttonSize}
              sx={{
                color: 'rgba(255,255,255,0.6)',
                '&:hover': {
                  color: '#1db954',
                  bgcolor: 'rgba(29,185,84,0.08)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease',
                padding: compact ? "2px" : "6px",
                minWidth: compact ? "24px" : "32px",
                minHeight: compact ? "24px" : "32px",
                "& .MuiSvgIcon-root": {
                  fontSize: compact ? "0.9rem" : "1.1rem"
                }
              }}
            >
              <DownloadIcon fontSize={iconSize} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 90, sm: 24 } }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{
            bgcolor: snackbar.severity === 'success' ? '#1db954' : undefined,
            '& .MuiAlert-icon': { color: 'white' },
            '& .MuiAlert-message': { color: 'white' },
            '& .MuiAlert-action': { color: 'white' },
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OfflineDownloadButton;
