import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Box,
  Avatar,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import { PushPin, PushPinOutlined } from "@mui/icons-material";
import like from "../assets/like.png";
import TrackMenu from "../components/TrackMenu";
import CreatePlaylistDialog from "../components/CreatePlaylistDialog";
import PlaylistMenu from "../components/PlaylistMenu";
import ImageUploader from "../components/ImageUploader";
import OfflineDownloadButton from "../components/OfflineDownloadButton";
import PlaylistDownloadButton from "../components/PlaylistDownloadButton";
import SafeAreaBox from "../components/SafeAreaBox";
import { hasOfflineSupport } from "../utils/platform";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useOfflineMode } from "../hooks/useOfflineMode";
import {
  apiGetPlaylists,
  apiGetLikedTracks,
  apiAddTrackToPlaylist,
  apiLikeTrack,
  apiUnlikeTrack,
  apiCreatePlaylist,
  apiGetPlaylistTracks,
  apiDeletePlaylist,
  apiRemoveTrackFromPlaylist,
  apiAddRecentlyPlayed,
  apiPinPlaylist,
  apiUploadPlaylistImage,
  apiRemovePlaylistImage
} from "../api";

// ---------------- Utils ----------------
export async function playTrack(track) {
  sessionStorage.setItem("currentTrack", JSON.stringify(track));
  sessionStorage.setItem("isPlaying", JSON.stringify(true));
  window.dispatchEvent(new Event("storage"));

  try {
    await apiAddRecentlyPlayed(track.id);
  } catch (err) {
    console.error("Error adding to recently played:", err);
  }
}

// Function to add to queue
function addToQueue(track, setToast) {
  if (window.addToQueue) {
    window.addToQueue(track);
    if (setToast) {
      setToast({ message: `"${track.title}" added to queue`, severity: "success" });
    }
    console.log(`Track added to queue: ${track.title}`);
  } else {
    console.warn("Player queue system not available");
    if (setToast) {
      setToast({ message: "Queue system not available", severity: "error" });
    }
  }
}

export function MarqueeText({ text }) {
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

// ---------------- Component ----------------
export default function UserPlaylists({ setToast }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isOnline } = useNetworkStatus();

  const [playlists, setPlaylists] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState({});
  const [selectedPlaylist, setSelectedPlaylist] = useState(() => {
    const saved = sessionStorage.getItem("selectedPlaylist");
    return saved ? JSON.parse(saved) : null;
  });
  const [likedTracksList, setLikedTracksList] = useState([]);

  // Dialog création playlist
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Check if should use offline mode
  const { shouldUseOfflineMode } = useOfflineMode();

  // ----- Fetch data -----
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playlistsData, likedData] = await Promise.all([
          apiGetPlaylists(),
          apiGetLikedTracks()
        ]);

        const likedTracks = likedData.map(t => t.id);
        setLikedTracks(likedTracks);

        // Filtrer les playlists pour éviter les doublons "Liked" (enlever celles qui pourraient déjà exister)
        const filteredPlaylists = playlistsData.filter(p => 
          !p.name.toLowerCase().includes('liked') && 
          p.id !== 'liked'
        );

        // Récupérer les tracks pour chaque playlist (sans les liked)
        const playlistsWithTracks = await Promise.all(
          filteredPlaylists.map(async (playlist) => {
            try {
              const tracks = await apiGetPlaylistTracks(playlist.id);
              return {
                ...playlist,
                tracks: tracks.map(t => ({
                  ...t,
                  url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
                }))
              };
            } catch (error) {
              console.error(`Erreur récupération tracks playlist ${playlist.id}:`, error);
              return { ...playlist, tracks: [] };
            }
          })
        );

        // Créer une playlist "Liked Songs" virtuelle
        const likedPlaylist = {
          id: 'liked',
          name: 'Liked Songs',
          tracks: likedData.map(t => ({
            ...t,
            url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
          })),
          image: likedData[0]?.image || null,
          isLikedPlaylist: true
        };

        // Combiner liked playlist en première position et autres playlists
        const allPlaylists = [likedPlaylist, ...playlistsWithTracks];
        setPlaylists(allPlaylists);

        // Créer le map des tracks pour compatibilité
        const tracksMap = {};
        tracksMap['liked'] = likedData.map(t => ({
          ...t,
          url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
        }));
        
        for (let pl of playlistsWithTracks) {
          tracksMap[pl.id] = pl.tracks;
        }
        setPlaylistTracks(tracksMap);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // Listen for liked tracks changes from other components
  useEffect(() => {
    const handleLikedTracksChanged = async () => {
      try {
        const liked = await apiGetLikedTracks();
        setLikedTracks(liked.map(t => t.id));
        const formattedLiked = liked.map(t => ({
          ...t,
          url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
        }));
        setLikedTracksList(formattedLiked);
        
        // Update the liked playlist in the playlists array
        setPlaylists(prevPlaylists => {
          const updatedPlaylists = [...prevPlaylists];
          const likedPlaylistIndex = updatedPlaylists.findIndex(p => p.isLikedPlaylist);
          if (likedPlaylistIndex !== -1) {
            updatedPlaylists[likedPlaylistIndex] = {
              ...updatedPlaylists[likedPlaylistIndex],
              tracks: formattedLiked,
              image: formattedLiked[0]?.image || null
            };
          }
          return updatedPlaylists;
        });
        
        // If currently viewing liked playlist, update displayed tracks
        if (selectedPlaylist?.isLikedPlaylist) {
          // Update the displayed tracks for liked playlist
          setPlaylistTracks(prev => ({
            ...prev,
            liked: formattedLiked
          }));
        }
      } catch (error) {
        console.error("Error updating liked tracks:", error);
      }
    };

    window.addEventListener('likedTracksChanged', handleLikedTracksChanged);
    return () => {
      window.removeEventListener('likedTracksChanged', handleLikedTracksChanged);
    };
  }, [selectedPlaylist]);

  // ----- Like / Unlike -----
  const handleLike = async (track) => {
    try {
      if (likedTracks.includes(track.id)) {
        await apiUnlikeTrack(track.id);
        setLikedTracks(prev => prev.filter(id => id !== track.id));
        if (setToast) {
          setToast({ message: `"${track.title}" removed from favorites`, severity: "info" });
        }
      } else {
        await apiLikeTrack(track.id);
        setLikedTracks(prev => [...prev, track.id]);
        if (setToast) {
          setToast({ message: `"${track.title}" added to favorites`, severity: "success" });
        }
      }
      
      // Immediate update of liked tracks like in Home
      try {
        const liked = await apiGetLikedTracks();
        const likedIds = liked.map(t => t.id);
        setLikedTracks(likedIds);
        
        const formattedLiked = liked.map(t => ({
          ...t,
          url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
        }));
        setLikedTracksList(formattedLiked);
        
        // Update the liked playlist in the playlists array immediately
        setPlaylists(prevPlaylists => {
          const updatedPlaylists = [...prevPlaylists];
          const likedPlaylistIndex = updatedPlaylists.findIndex(p => p.isLikedPlaylist);
          if (likedPlaylistIndex !== -1) {
            updatedPlaylists[likedPlaylistIndex] = {
              ...updatedPlaylists[likedPlaylistIndex],
              tracks: formattedLiked,
              image: formattedLiked[0]?.image || null
            };
          }
          return updatedPlaylists;
        });
        
        // If currently viewing liked playlist, update displayed tracks
        if (selectedPlaylist?.isLikedPlaylist) {
          setPlaylistTracks(prev => ({
            ...prev,
            liked: formattedLiked
          }));
        }
      } catch (updateError) {
        console.error("Error updating liked tracks after like/unlike:", updateError);
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('likedTracksChanged'));
    } catch (error) {
      console.error("Error toggling like:", error);
      if (setToast) {
        setToast({ message: "Error updating favorites", severity: "error" });
      }
    }
  };

  // Handle add to playlist
  const handleAddToPlaylist = async (playlistId, track) => {
    try {
      // Check if track is already in the playlist
      const currentTracks = playlistTracks[playlistId] || [];
      const trackExists = currentTracks.some(t => t.id === track.id);
      
      if (trackExists) {
        const playlist = playlists.find(p => p.id === playlistId);
        setToast({ message: `"${track.title}" is already in "${playlist?.name}"`, severity: "warning" });
        return;
      }

      await apiAddTrackToPlaylist(playlistId, track.id);
      const updated = [...(playlistTracks[playlistId] || []), track];
      setPlaylistTracks({ ...playlistTracks, [playlistId]: updated });
      
      // Update selectedPlaylist if it's the playlist we just added to
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist({ ...selectedPlaylist, tracks: updated });
      }
      
      const playlist = playlists.find(p => p.id === playlistId);
      setToast({ message: `"${track.title}" added to "${playlist?.name}"`, severity: "success" });
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('playlistsChanged'));
    } catch (e) { 
      console.error(e);
      setToast({ message: "Error adding to playlist", severity: "error" });
    }
  };

  // Handle create new playlist (called from PlaylistMenu)
  const handleCreatePlaylist = (track) => {
    setOpenCreateDialog(true);
  };

  // Handle actual playlist creation with name
  const handleCreatePlaylistWithName = async (playlistName) => {
    try {
      const newPl = await apiCreatePlaylist(playlistName);
      setPlaylists([...playlists, newPl]);
      setPlaylistTracks({ ...playlistTracks, [newPl.id]: [] });
      setToast({ message: `Playlist créée : ${playlistName}`, severity: "success" });
      setOpenCreateDialog(false);
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('playlistsChanged'));
    } catch (e) { console.error(e); }
  };

  // ----- Supprimer playlist -----
  const handleDeletePlaylist = async (playlistId) => {
    try {
      await apiDeletePlaylist(playlistId);
      setPlaylists(playlists.filter(pl => pl.id !== playlistId));
      const newTracks = { ...playlistTracks };
      delete newTracks[playlistId];
      setPlaylistTracks(newTracks);
      setToast({ message: `Playlist supprimée`, severity: "success" });
      if (selectedPlaylist?.id === playlistId) setSelectedPlaylist(null);
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('playlistsChanged'));
    } catch (e) { console.error(e); }
  };

  // ----- Pin/Unpin playlist -----
  const handlePinPlaylist = async (playlistId, isPinned) => {
    try {
      await apiPinPlaylist(playlistId, !isPinned);
      setPlaylists(playlists.map(pl => 
        pl.id === playlistId ? { ...pl, is_pinned: !isPinned } : pl
      ));
      setToast({ message: `Playlist ${!isPinned ? 'épinglée' : 'désépinglée'}`, severity: "success" });
    } catch (e) { 
      console.error(e);
      setToast({ message: `Erreur lors du pin/unpin`, severity: "error" });
    }
  };

  // ----- Supprimer un track d'une playlist -----
  const handleRemoveTrackFromPlaylist = async (playlistId, trackId) => {
    try {
      await apiRemoveTrackFromPlaylist(playlistId, trackId);
      const updated = playlistTracks[playlistId].filter(t => t.id !== trackId);
      setPlaylistTracks({ ...playlistTracks, [playlistId]: updated });
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist({ ...selectedPlaylist, tracks: updated });
      }
      setToast({ message: `Track supprimé de la playlist`, severity: "success" });
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('playlistsChanged'));
    } catch (e) { console.error(e); }
  };

  // ----- Gestion des images de playlist -----
  const handlePlaylistImageUpload = async (playlistId, imageData) => {
    try {
      await apiUploadPlaylistImage(playlistId, imageData);
      
      // Mettre à jour la playlist dans l'état local
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(pl => 
          pl.id === playlistId ? { ...pl, custom_image: imageData } : pl
        )
      );
      
      // Mettre à jour selectedPlaylist si c'est celle qu'on modifie
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(prev => ({ ...prev, custom_image: imageData }));
      }
      
      setToast({ message: "Image de playlist mise à jour ✅", severity: "success" });
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('playlistsChanged'));
    } catch (error) {
      console.error("Error uploading playlist image:", error);
      setToast({ message: "Erreur lors de l'upload ❌", severity: "error" });
    }
  };

  const handlePlaylistImageRemove = async (playlistId) => {
    try {
      await apiRemovePlaylistImage(playlistId);
      
      // Mettre à jour la playlist dans l'état local
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(pl => 
          pl.id === playlistId ? { ...pl, custom_image: null } : pl
        )
      );
      
      // Mettre à jour selectedPlaylist si c'est celle qu'on modifie
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(prev => ({ ...prev, custom_image: null }));
      }
      
      setToast({ message: "Image de playlist supprimée ✅", severity: "success" });
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('playlistsChanged'));
    } catch (error) {
      console.error("Error removing playlist image:", error);
      setToast({ message: "Erreur lors de la suppression ❌", severity: "error" });
    }
  };

  // ----- Persist selected playlist -----
  useEffect(() => {
    if (selectedPlaylist) {
      sessionStorage.setItem("selectedPlaylist", JSON.stringify(selectedPlaylist));
    } else {
      sessionStorage.removeItem("selectedPlaylist");
    }
  }, [selectedPlaylist]);

  // Listen for playlist changes from other components
  useEffect(() => {
    const handlePlaylistsChanged = () => {
      console.log('Playlists changed event received in UserPlaylists');
      const fetchData = async () => {
        try {
          const [playlistsData, likedData] = await Promise.all([
            apiGetPlaylists(),
            apiGetLikedTracks()
          ]);

          setPlaylists(playlistsData);
          setLikedTracks(likedData.map(t => t.id));
          setLikedTracksList(likedData.map(t => ({
            ...t,
            url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
          })));

          // Load tracks for each playlist
          const tracksData = {};
          for (const playlist of playlistsData) {
            try {
              const tracks = await apiGetPlaylistTracks(playlist.id);
              tracksData[playlist.id] = tracks.map(t => ({
                ...t,
                url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
              }));
            } catch (error) {
              console.error(`Error loading tracks for playlist ${playlist.id}:`, error);
              tracksData[playlist.id] = [];
            }
          }
          setPlaylistTracks(tracksData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    };

    window.addEventListener('playlistsChanged', handlePlaylistsChanged);

    return () => {
      window.removeEventListener('playlistsChanged', handlePlaylistsChanged);
    };
  }, []);

  const displayPlaylists = [
    ...playlists
      .map(pl => ({ ...pl, tracks: playlistTracks[pl.id] || [] }))
      .sort((a, b) => {
        // Trie par is_pinned d'abord (pinned en premier), puis par created_at
        if (a.isLikedPlaylist && !b.isLikedPlaylist) return -1;
        if (!a.isLikedPlaylist && b.isLikedPlaylist) return 1;
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      })
  ];

  // ----- Render -----
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 12 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Playlists</Typography>

      {/* Offline Mode Alert */}
      {shouldUseOfflineMode && (
        <Alert 
          severity="info" 
          sx={{ 
            bgcolor: "rgba(33, 150, 243, 0.1)", 
            color: "#90caf9",
            border: "1px solid rgba(33, 150, 243, 0.3)"
          }}
        >
          You are offline. Only downloaded playlists are available.
        </Alert>
      )}

      {/* Liste des playlists */}
      {!selectedPlaylist && displayPlaylists.map(pl => (
        <Paper
          key={pl.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 1.5,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 2,
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(29,219,84,0.1)" },
          }}
        >
          <Avatar
            src={pl.isLikedPlaylist ? like : (pl.custom_image || pl.tracks[0]?.image || "")}
            variant="rounded"
            sx={{ width: isMobile ? 40 : 50, height: isMobile ? 40 : 50 }}
            onClick={() => setSelectedPlaylist(pl)}
          />
          <Box sx={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setSelectedPlaylist(pl)}>
            <MarqueeText text={pl.name} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
              {pl.tracks.length} titres
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {!pl.isLikedPlaylist && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinPlaylist(pl.id, pl.is_pinned);
                }}
                sx={{
                  color: pl.is_pinned ? "#1db954" : "rgba(255,255,255,0.4)",
                  "&:hover": { color: "#1db954" },
                  width: isMobile ? 28 : 36,
                  height: isMobile ? 28 : 36
                }}
                title={pl.is_pinned ? "Désépingler" : "Épingler"}
              >
                {pl.is_pinned ? <PushPin fontSize={isMobile ? "small" : "medium"} /> : <PushPinOutlined fontSize={isMobile ? "small" : "medium"} />}
              </IconButton>
            )}
            {!pl.isLikedPlaylist && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePlaylist(pl.id);
                }}
                sx={{
                  color: "rgba(255,255,255,0.4)",
                  "&:hover": { color: "#1db954" },
                  width: isMobile ? 28 : 36,
                  height: isMobile ? 28 : 36
                }}
              >
                <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            )}
          </Box>
        </Paper>
      ))}

      {/* Liste des tracks d'une playlist */}
      {selectedPlaylist?.tracks && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{ color: "#1db954", cursor: "pointer", mb: 2 }}
            onClick={() => setSelectedPlaylist(null)}
          >
            ← Back to playlists
          </Typography>

            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  {!selectedPlaylist.isLikedPlaylist ? (
                    <ImageUploader
                      currentImage={selectedPlaylist.custom_image || selectedPlaylist.tracks[0]?.image}
                      onImageUpload={(imageData) => handlePlaylistImageUpload(selectedPlaylist.id, imageData)}
                      onImageRemove={() => handlePlaylistImageRemove(selectedPlaylist.id)}
                      size={isMobile ? 80 : 120}
                      isRound={false}
                      label="Playlist Cover"
                    />
                  ) : (
                    <Avatar
                      variant="rounded"
                      src={like}
                      sx={{ 
                        width: isMobile ? 80 : 120, 
                        height: isMobile ? 80 : 120,
                        border: "2px solid #1db954"
                      }}
                    />
                  )}
                  <Box>
                    <Typography sx={{ 
                      color: "#fff", 
                      fontWeight: 700, 
                      fontSize: isMobile ? "1.5rem" : "2rem",
                      mb: 1
                    }}>
                      {selectedPlaylist.name}
                    </Typography>
                    <Typography sx={{ 
                      color: "rgba(255,255,255,0.7)", 
                      fontSize: isMobile ? "0.9rem" : "1rem"
                    }}>
                      {selectedPlaylist.tracks.length} tracks
                    </Typography>
                  </Box>
                  
                  {/* Playlist Download Button */}
                  <Box ml="auto">
                    <PlaylistDownloadButton 
                      playlist={selectedPlaylist} 
                      tracks={selectedPlaylist.tracks}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Box>
                </Box>
              </Box>

          {selectedPlaylist.tracks.map((track, idx) => (
            <Paper
              key={track.id || idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: isMobile ? 1 : 1.5,
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(29,219,84,0.1)" },
                minHeight: isMobile ? 56 : 64,
                gap: 1,
              }}
            >
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 2, 
                cursor: "pointer", 
                flex: 1, 
                minWidth: 0 
              }} onClick={() => playTrack(track)}>
                <Avatar
                  variant="rounded"
                  src={track.image || ""}
                  alt={track.title || "Track"}
                  sx={{ width: isMobile ? 36 : 48, height: isMobile ? 36 : 48, flexShrink: 0 }}
                />
                <Box sx={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
                  <Typography sx={{ 
                    color: "#fff", 
                    fontWeight: 600,
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {track.title || "Unknown Title"}
                  </Typography>
                  <Typography sx={{ 
                    color: "rgba(255,255,255,0.7)", 
                    fontSize: isMobile ? "0.75rem" : "0.8rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {track.artist || "Unknown Artist"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  onClick={() => handleLike(track)}
                  sx={{ color: likedTracks.includes(track.id) ? "#1db954" : "#fff", width: isMobile ? 28 : 36, height: isMobile ? 28 : 36 }}
                >
                  {likedTracks.includes(track.id) ? (
                    <FavoriteIcon fontSize={isMobile ? "small" : "medium"} />
                  ) : (
                    <FavoriteBorderIcon fontSize={isMobile ? "small" : "medium"} />
                  )}
                </IconButton>

                <PlaylistMenu
                  track={track}
                  playlists={playlists.filter(p => p.id !== selectedPlaylist?.id)}
                  onAddToPlaylist={handleAddToPlaylist}
                  onCreatePlaylist={handleCreatePlaylist}
                />

                {!selectedPlaylist.isLikedPlaylist && (
                  <IconButton
                    onClick={() => handleRemoveTrackFromPlaylist(selectedPlaylist.id, track.id)}
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      "&:hover": { color: "#ff4d4d" },
                      width: isMobile ? 28 : 36,
                      height: isMobile ? 28 : 36
                    }}
                  >
                    <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                )}

                {/* Offline Download Button */}
                <OfflineDownloadButton track={track} size={isMobile ? "small" : "medium"} />

                <TrackMenu
                  track={track}
                  onPlay={playTrack}
                  onToggleLike={handleLike}
                  onAddToQueue={(track) => addToQueue(track, setToast)}
                  showPlayOption={false} // Can already click on track
                  setToast={setToast}
                />
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create Playlist Dialog */}
      <CreatePlaylistDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreatePlaylist={handleCreatePlaylistWithName}
        title="Create a new playlist"
      />
    </Box>
  );
}
