import React, { useState } from 'react';
import { 
  IconButton, 
  Tooltip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  PlaylistPlay as PlaylistIcon
} from '@mui/icons-material';

import { hasOfflineSupport } from '../utils/platform';
import offlineDownloadService from '../services/offlineDownload';

const PlaylistDownloadButton = ({ playlist, tracks, size = 'medium' }) => {
  const [downloadDialog, setDownloadDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [errors, setErrors] = useState([]);

  const handleDownloadPlaylist = async () => {
    if (!hasOfflineSupport() || !tracks || tracks.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress({});
    setDownloadedCount(0);
    setErrors([]);

    const totalTracks = tracks.filter(track => !offlineDownloadService.isTrackOffline(track.id));
    
    if (totalTracks.length === 0) {
      setErrors(['All tracks in this playlist are already downloaded']);
      setIsDownloading(false);
      return;
    }

    let completed = 0;
    const newErrors = [];

    for (const track of totalTracks) {
      try {
        setDownloadProgress(prev => ({
          ...prev,
          [track.id]: { status: 'downloading', progress: 0 }
        }));

        await offlineDownloadService.downloadTrack(track, (progress) => {
          setDownloadProgress(prev => ({
            ...prev,
            [track.id]: { status: 'downloading', progress }
          }));
        }, { name: playlist.name, id: playlist.id });

        setDownloadProgress(prev => ({
          ...prev,
          [track.id]: { status: 'completed', progress: 100 }
        }));

        completed++;
        setDownloadedCount(completed);

      } catch (error) {
        console.error(`Failed to download ${track.title}:`, error);
        newErrors.push(`${track.title}: ${error.message}`);
        
        setDownloadProgress(prev => ({
          ...prev,
          [track.id]: { status: 'error', progress: 0 }
        }));
      }
    }

    setErrors(newErrors);
    setIsDownloading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'downloading': return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (track) => {
    if (offlineDownloadService.isTrackOffline(track.id)) {
      return 'Already downloaded';
    }
    
    const progress = downloadProgress[track.id];
    if (!progress) return 'Waiting...';
    
    switch (progress.status) {
      case 'downloading': return `${Math.round(progress.progress)}%`;
      case 'completed': return 'Completed';
      case 'error': return 'Failed';
      default: return 'Waiting...';
    }
  };

  // Don't show on web platform
  if (!hasOfflineSupport()) {
    return null;
  }

  const totalTracks = tracks?.length || 0;
  const alreadyDownloaded = tracks?.filter(track => 
    offlineDownloadService.isTrackOffline(track.id)
  ).length || 0;
  const toDownload = totalTracks - alreadyDownloaded;

  return (
    <>
      <Tooltip title={toDownload > 0 ? `Download ${toDownload} tracks` : 'All tracks downloaded'}>
        <IconButton 
          onClick={() => setDownloadDialog(true)}
          size={size}
          disabled={toDownload === 0}
          sx={{
            color: toDownload > 0 ? 'rgba(255,255,255,0.6)' : '#1db954',
            '&:hover': {
              color: toDownload > 0 ? '#1db954' : '#1db954',
              bgcolor: 'rgba(29,185,84,0.08)',
              transform: 'scale(1.1)'
            },
            '&:disabled': {
              color: '#1db954',
              opacity: 0.7
            },
            transition: 'all 0.2s ease'
          }}
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip>

      <Dialog 
        open={downloadDialog} 
        onClose={() => !isDownloading && setDownloadDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#121212',
            backgroundImage: 'none',
            color: 'white',
            borderRadius: 3,
            border: '1px solid #333'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: '#fff',
          borderBottom: '1px solid #333',
          pb: 2
        }}>
          <PlaylistIcon sx={{ color: '#1db954' }} />
          Download Playlist
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          <Box mb={2}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              {playlist?.name || 'Unknown Playlist'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
              {totalTracks} total tracks • {alreadyDownloaded} downloaded • {toDownload} remaining
            </Typography>
            
            {isDownloading && (
              <Box mt={3}>
                <Typography variant="body2" gutterBottom sx={{ color: '#fff' }}>
                  Progress: {downloadedCount} / {toDownload} completed
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(downloadedCount / toDownload) * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: '#333',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#1db954',
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            )}
          </Box>

          {errors.length > 0 && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                bgcolor: 'rgba(255,193,7,0.1)',
                border: '1px solid rgba(255,193,7,0.3)',
                color: '#fff',
                '& .MuiAlert-icon': { color: '#ffc107' }
              }}
            >
              <Typography variant="body2" fontWeight="bold">Download errors:</Typography>
              {errors.slice(0, 3).map((error, index) => (
                <Typography key={index} variant="body2">{error}</Typography>
              ))}
              {errors.length > 3 && (
                <Typography variant="body2">... and {errors.length - 3} more</Typography>
              )}
            </Alert>
          )}

          {(isDownloading || Object.keys(downloadProgress).length > 0) && (
            <Box 
              sx={{ 
                maxHeight: 300, 
                overflow: 'auto',
                bgcolor: '#1a1a1a',
                borderRadius: 2,
                border: '1px solid #333'
              }}
            >
              {tracks?.map((track) => (
                <Box
                  key={track.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid #333',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                      {track.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                      {track.artist}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusText(track)}
                    color={getStatusColor(downloadProgress[track.id]?.status)}
                    size="small"
                    variant="outlined"
                    sx={{
                      bgcolor: 'transparent',
                      color: '#fff',
                      borderColor: '#555',
                      '&.MuiChip-colorSuccess': {
                        color: '#1db954',
                        borderColor: '#1db954'
                      },
                      '&.MuiChip-colorError': {
                        color: '#ff6b6b',
                        borderColor: '#ff6b6b'
                      },
                      '&.MuiChip-colorPrimary': {
                        color: '#1db954',
                        borderColor: '#1db954'
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
          <Button 
            onClick={() => setDownloadDialog(false)}
            disabled={isDownloading}
            sx={{
              color: '#b3b3b3',
              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
            }}
          >
            {isDownloading ? 'Downloading...' : 'Close'}
          </Button>
          {!isDownloading && toDownload > 0 && (
            <Button 
              onClick={handleDownloadPlaylist}
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{
                bgcolor: '#1db954',
                color: 'white',
                '&:hover': { bgcolor: '#1ed760' },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Download {toDownload} Tracks
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlaylistDownloadButton;
