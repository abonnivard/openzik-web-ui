import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudDownload,
  MusicNote,
  Storage
} from '@mui/icons-material';

import { hasOfflineSupport } from '../utils/platform';
import offlineDownloadService from '../services/offlineDownload';
import { formatDuration } from '../utils';

const DownloadedMusic = ({ setToast }) => {
  const [downloadedTracks, setDownloadedTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    loadDownloadedTracks();
  }, []);

  const loadDownloadedTracks = async () => {
    if (!hasOfflineSupport()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const tracks = await offlineDownloadService.getAllOfflineTracks();
      setDownloadedTracks(tracks);
      
      // Calculate total size
      const size = tracks.reduce((total, track) => total + (track.fileSize || 0), 0);
      setTotalSize(size);
    } catch (error) {
      console.error('Error loading downloaded tracks:', error);
      setToast?.({ message: 'Error loading downloaded tracks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (track) => {
    sessionStorage.setItem("currentTrack", JSON.stringify(track));
    sessionStorage.setItem("isPlaying", JSON.stringify(true));
    window.dispatchEvent(new Event("storage"));
  };

  const deleteTrack = async (trackId) => {
    try {
      const success = await offlineDownloadService.deleteOfflineTrack(trackId);
      if (success) {
        await loadDownloadedTracks(); // Reload list
        setToast?.({ message: 'Track deleted from offline storage', severity: 'success' });
      } else {
        setToast?.({ message: 'Failed to delete track', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      setToast?.({ message: 'Error deleting track', severity: 'error' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const clearAllDownloads = async () => {
    if (window.confirm('Are you sure you want to delete all downloaded music?')) {
      try {
        for (const track of downloadedTracks) {
          await offlineDownloadService.deleteOfflineTrack(track.id);
        }
        await loadDownloadedTracks();
        setToast?.({ message: 'All downloads cleared', severity: 'success' });
      } catch (error) {
        console.error('Error clearing downloads:', error);
        setToast?.({ message: 'Error clearing downloads', severity: 'error' });
      }
    }
  };

  // Don't show on web platform
  if (!hasOfflineSupport()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Downloaded music management is only available on the mobile app.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 12 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CloudDownload sx={{ color: '#1db954' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Downloaded Music
        </Typography>
      </Box>

      {/* Storage Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Storage sx={{ color: '#1db954' }} />
          <Typography variant="h6">Storage Info</Typography>
        </Box>
        <Typography variant="body2" color="rgba(255,255,255,0.7)">
          {downloadedTracks.length} tracks • {formatFileSize(totalSize)}
        </Typography>
        {downloadedTracks.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={clearAllDownloads}
            sx={{ mt: 2 }}
          >
            Clear All Downloads
          </Button>
        )}
      </Paper>

      {downloadedTracks.length === 0 ? (
        <Alert severity="info" sx={{ bgcolor: 'rgba(33, 150, 243, 0.1)', color: '#90caf9' }}>
          No music downloaded yet. Use the download buttons throughout the app to save music for offline listening.
        </Alert>
      ) : (
        <Box>
          {downloadedTracks.map((track, index) => (
            <Paper
              key={track.id}
              onClick={() => playTrack(track)}
              sx={{
                marginBottom: 1,
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { 
                  bgcolor: 'rgba(29,219,84,0.1)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar
                  src={track.image}
                  sx={{ width: 56, height: 56, mr: 2, borderRadius: 1 }}
                >
                  <MusicNote />
                </Avatar>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>
                    {track.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b3b3b3', mt: 0.5 }}>
                    {track.artist} • {track.album}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', mt: 0.5, display: 'block' }}>
                    {formatFileSize(track.fileSize || 0)}
                  </Typography>
                </Box>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTrack(track.id);
                  }}
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    '&:hover': { color: '#ff6b6b', bgcolor: 'rgba(255,107,107,0.08)' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DownloadedMusic;
