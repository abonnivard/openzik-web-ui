import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  IconButton,
  Alert,
  Button
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  WifiOff,
  Wifi
} from '@mui/icons-material';

import { hasOfflineSupport } from '../utils/platform';
import { useOfflineMode } from '../hooks/useOfflineMode';
import offlineDownloadService from '../services/offlineDownload';
import TrackMenu from '../components/TrackMenu';
import PlaylistMenu from '../components/PlaylistMenu';

// Function pour lire une track depuis un fichier local téléchargé
async function playTrack(track) {
  try {
    // Récupérer l'URI du fichier local téléchargé
    const localUri = await offlineDownloadService.getOfflineTrackUri(track.id);
    
    if (!localUri) {
      console.error('No local file found for track:', track.title);
      return;
    }
    
    // Créer une copie de la track avec l'URI locale
    const localTrack = {
      ...track,
      url: localUri, // Utiliser l'URI du fichier local
      isOffline: true
    };
    
    console.log('Playing offline track:', localTrack.title, 'from:', localUri);
    
    sessionStorage.setItem("currentTrack", JSON.stringify(localTrack));
    sessionStorage.setItem("isPlaying", JSON.stringify(true));
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.error('Error playing offline track:', error);
  }
}

// Function to add to queue (avec support des fichiers locaux)
async function addToQueue(track, setToast) {
  if (window.addToQueue) {
    try {
      // Récupérer l'URI du fichier local téléchargé
      const localUri = await offlineDownloadService.getOfflineTrackUri(track.id);
      
      if (!localUri) {
        console.error('No local file found for track:', track.title);
        if (setToast) {
          setToast({ message: "Local file not found", severity: "error" });
        }
        return;
      }
      
      // Créer une copie de la track avec l'URI locale
      const localTrack = {
        ...track,
        url: localUri, // Utiliser l'URI du fichier local
        isOffline: true
      };
      
      window.addToQueue(localTrack);
      if (setToast) {
        setToast({ message: `"${track.title}" added to queue`, severity: "success" });
      }
    } catch (error) {
      console.error('Error adding offline track to queue:', error);
      if (setToast) {
        setToast({ message: "Error adding track to queue", severity: "error" });
      }
    }
  } else {
    console.warn("Player queue system not available");
    if (setToast) {
      setToast({ message: "Queue system not available", severity: "error" });
    }
  }
}

function MarqueeText({ text }) {
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      setNeedsScroll(textRef.current.scrollWidth > containerRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <div ref={containerRef} style={{ overflow: "hidden", width: "100%" }}>
      <Typography
        ref={textRef}
        sx={{
          display: "inline-block",
          whiteSpace: "nowrap",
          color: "#fff",
          fontSize: "0.9rem",
          animation: needsScroll ? "marquee 10s linear infinite" : "none",
        }}
      >
        {text}
      </Typography>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

const OfflineLibrary = ({ setToast }) => {
  const { shouldUseOfflineMode: isOfflineMode, disableOfflineMode, canGoOffline } = useOfflineMode();
  const [offlineTracks, setOfflineTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  useEffect(() => {
    loadOfflineContent();
    loadLikedTracks();
  }, []);

  const loadOfflineContent = async () => {
    if (!hasOfflineSupport()) {
      console.log('Offline support not available');
      return;
    }

    try {
      console.log('Loading offline content...');
      const tracks = await offlineDownloadService.getAllOfflineTracks();
      const playlistsData = await offlineDownloadService.getAllOfflinePlaylists();
      
      console.log('Loaded offline tracks:', tracks.length, tracks);
      console.log('Loaded offline playlists:', playlistsData.length, playlistsData);
      
      setOfflineTracks(tracks);
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Error loading offline content:', error);
      if (error.message !== 'Application is in offline mode') {
        setToast?.({ message: 'Error loading offline content', severity: 'error' });
      }
    }
  };

  const loadLikedTracks = () => {
    try {
      const liked = JSON.parse(localStorage.getItem('likedTracks') || '[]');
      setLikedTracks(liked);
    } catch (error) {
      console.error('Error loading liked tracks:', error);
    }
  };

  const isTrackLiked = (trackId) => {
    return likedTracks.some(track => track.id === trackId);
  };

  const toggleLike = (track) => {
    const newLikedTracks = isTrackLiked(track.id)
      ? likedTracks.filter(t => t.id !== track.id)
      : [...likedTracks, track];
    
    setLikedTracks(newLikedTracks);
    localStorage.setItem('likedTracks', JSON.stringify(newLikedTracks));
    setToast?.({ 
      message: isTrackLiked(track.id) ? 'Removed from favorites' : 'Added to favorites', 
      severity: 'success' 
    });
  };

  const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key] || 'Unknown';
      (result[group] = result[group] || []).push(item);
      return result;
    }, {});
  };

  const filteredTracks = offlineTracks.filter(track =>
    track.title?.toLowerCase().includes(search.toLowerCase()) ||
    track.artist?.toLowerCase().includes(search.toLowerCase()) ||
    track.album?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Group filtered tracks
  const tracksByArtist = groupBy(filteredTracks, 'artist');
  const tracksByAlbum = groupBy(filteredTracks, 'album');

  const renderTrackList = (tracks) => (
    tracks.map((track) => (
      <Paper
        key={track.id}
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
        onClick={() => playTrack(track)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Avatar
            src={track.albumArt || track.image}
            sx={{ width: 48, height: 48, mr: 2, borderRadius: 1 }}
          >
            <WifiOff />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <MarqueeText text={track.title || 'Unknown Title'} />
            <Typography variant="body2" sx={{ 
              color: '#b3b3b3', 
              mt: 0.5,
              fontSize: "0.8rem"
            }}>
              {track.artist || 'Unknown Artist'} • {track.album || 'Unknown Album'}
            </Typography>
          </Box>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(track);
            }}
            sx={{ 
              color: isTrackLiked(track.id) ? '#ff6b6b' : '#b3b3b3', 
              mr: 1,
              padding: '6px'
            }}
          >
            {isTrackLiked(track.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>

          <TrackMenu
            track={track}
            onPlay={() => playTrack(track)}
            onAddToQueue={async () => await addToQueue(track, setToast)}
            isOffline={true}
            showPlayOption={false}
          />
        </Box>
      </Paper>
    ))
  );

  const renderPlaylistList = (playlists) => (
    playlists.map((playlist) => (
      <Paper
        key={playlist.id}
        sx={{
          marginBottom: 1,
          bgcolor: 'rgba(255,255,255,0.05)',
          borderRadius: 2,
          overflow: 'hidden',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Avatar
            src={playlist.image}
            sx={{ width: 48, height: 48, mr: 2, borderRadius: 1 }}
          >
            <WifiOff />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ 
              color: '#fff',
              fontSize: "0.9rem"
            }}>
              {playlist.name}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#b3b3b3', 
              mt: 0.5,
              fontSize: "0.8rem"
            }}>
              {playlist.trackCount || 0} tracks • Offline
            </Typography>
          </Box>

          <PlaylistMenu
            playlist={playlist}
            isOffline={true}
          />
        </Box>
      </Paper>
    ))
  );

  if (!hasOfflineSupport()) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 12 }}>
        <Alert severity="info">
          Offline functionality is only available on mobile devices.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 12 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>
        Offline Library
      </Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search offline music..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255,255,255,0.05)',
            '& fieldset': { borderColor: '#333' },
            '&:hover fieldset': { borderColor: '#555' },
            '&.Mui-focused fieldset': { borderColor: '#1db954' },
          },
          '& .MuiOutlinedInput-input': { color: '#fff' },
        }}
      />

      {/* Navigation */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          onClick={() => { setSelectedArtist(null); setSelectedAlbum(null); }}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: !selectedArtist && !selectedAlbum ? '#1db954' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            '&:hover': { backgroundColor: !selectedArtist && !selectedAlbum ? '#1db954' : 'rgba(255,255,255,0.08)' }
          }}
        >
          All
        </Box>
        <Box
          onClick={() => { setSelectedArtist('playlists'); setSelectedAlbum(null); }}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: selectedArtist === 'playlists' ? '#1db954' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            cursor: 'pointer',
            '&:hover': { backgroundColor: selectedArtist === 'playlists' ? '#1db954' : 'rgba(255,255,255,0.08)' }
          }}
        >
          Playlists
        </Box>
      </Box>

      {/* Content */}
      {selectedArtist === 'playlists' ? (
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
            Offline Playlists ({filteredPlaylists.length})
          </Typography>
          {filteredPlaylists.length === 0 ? (
            <Typography sx={{ color: '#b3b3b3', textAlign: 'center', mt: 4 }}>
              No offline playlists found
            </Typography>
          ) : (
            renderPlaylistList(filteredPlaylists)
          )}
        </Box>
      ) : selectedArtist && selectedArtist !== 'playlists' ? (
        selectedAlbum ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ color: '#1db954', cursor: 'pointer' }}
                onClick={() => setSelectedAlbum(null)}
              >
                ← Back to {selectedArtist}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
              {selectedAlbum} ({tracksByAlbum[selectedAlbum]?.length || 0} tracks)
            </Typography>
            {renderTrackList(tracksByAlbum[selectedAlbum] || [])}
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ color: '#1db954', cursor: 'pointer' }}
                onClick={() => setSelectedArtist(null)}
              >
                ← Back to All
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
              {selectedArtist} ({tracksByArtist[selectedArtist]?.length || 0} tracks)
            </Typography>
            {renderTrackList(tracksByArtist[selectedArtist] || [])}
          </Box>
        )
      ) : (
        <Box>
          {/* Artists */}
          {Object.keys(tracksByArtist).length > 0 && (
            <>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                Artists ({Object.keys(tracksByArtist).length})
              </Typography>
              {Object.keys(tracksByArtist).map(artist => (
                <Paper
                  key={artist}
                  onClick={() => setSelectedArtist(artist)}
                  sx={{
                    marginBottom: 1,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <Avatar
                      src={tracksByArtist[artist][0]?.albumArt || tracksByArtist[artist][0]?.image}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    >
                      <WifiOff />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ 
                        color: '#fff',
                        fontSize: "0.9rem"
                      }}>
                        {artist}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#b3b3b3',
                        fontSize: "0.8rem"
                      }}>
                        {tracksByArtist[artist].length} tracks
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </>
          )}

          {/* Recent Tracks */}
          {filteredTracks.length > 0 && (
            <Box sx={{ mt: Object.keys(tracksByArtist).length > 0 ? 4 : 0 }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                All Tracks ({filteredTracks.length})
              </Typography>
              {renderTrackList(filteredTracks)}
            </Box>
          )}

          {offlineTracks.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography sx={{ color: '#b3b3b3', mb: 2 }}>
                No music downloaded for offline listening.
              </Typography>
              <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                Use the download buttons throughout the app to add music for offline listening.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default OfflineLibrary;
