import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Box,
  Avatar,
  TextField,
  Paper,
  IconButton
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TrackMenu from "../components/TrackMenu";
import PlaylistMenu from "../components/PlaylistMenu";
import CreatePlaylistDialog from "../components/CreatePlaylistDialog";
import {
  apiGetLibrary,
  apiGetPlaylists,
  apiLikeTrack,
  apiUnlikeTrack,
  apiCreatePlaylist,
  apiGetLikedTracks,
  apiAddTrackToPlaylist,
  apiAddRecentlyPlayed
} from "../api";

// ----------- Utils -----------
async function playTrack(track) {
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

// ----------- Component -----------
export default function Library({ setToast }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState(() => sessionStorage.getItem("playerQuery") || "");
  const [selectedArtist, setSelectedArtist] = useState(() => sessionStorage.getItem("selectedArtist") || null);
  const [selectedAlbum, setSelectedAlbum] = useState(() => sessionStorage.getItem("selectedAlbum") || null);

  const [likedTracks, setLikedTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // Dialog création playlist
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  // Charger bibliothèque
  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await apiGetLibrary();
        const tracksWithUrl = (res || []).map((t) => ({
          ...t,
          url: `http://localhost:3000/${t.file_path
            .split(/[\\/]/)
            .map(encodeURIComponent)
            .join("/")}`,
        }));
        setItems(tracksWithUrl);
        sessionStorage.setItem("library", JSON.stringify(tracksWithUrl));
      } catch (e) {
        const local = JSON.parse(sessionStorage.getItem("library") || "[]");
        setItems(local);
      }
    };
    fetchLibrary();
  }, []);

  // Charger les playlists et les likes de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const liked = await apiGetLikedTracks();
        setLikedTracks(liked.map(t => t.id));
        const pls = await apiGetPlaylists();
        setPlaylists(pls);
      } catch (e) {
        console.warn("Erreur chargement user data", e);
      }
    };
    fetchUserData();
  }, []);

  // Listen for liked tracks changes from other components
  useEffect(() => {
    const handleLikedTracksChanged = async () => {
      try {
        const liked = await apiGetLikedTracks();
        setLikedTracks(liked.map(t => t.id));
      } catch (error) {
        console.error("Error updating liked tracks:", error);
      }
    };

    window.addEventListener('likedTracksChanged', handleLikedTracksChanged);
    return () => {
      window.removeEventListener('likedTracksChanged', handleLikedTracksChanged);
    };
  }, []);

  // Like / Unlike
  const handleLike = async (track) => {
    const trackId = typeof track === 'object' ? track.id : track;
    try {
      if (likedTracks.includes(trackId)) {
        await apiUnlikeTrack(trackId);
        setLikedTracks(likedTracks.filter(id => id !== trackId));
      } else {
        await apiLikeTrack(trackId);
        setLikedTracks([...likedTracks, trackId]);
      }
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('likedTracksChanged'));
    } catch (e) {
      console.error("Error like/unlike", e);
    }
  };

  // Handle add to playlist
  const handleAddToPlaylist = async (playlistId, track) => {
    try {
      // Check if track is already in the playlist
      const trackExists = false; // Could check here if needed
      if (trackExists) {
        setToast({ message: `"${track.title}" is already in this playlist`, severity: "warning" });
        return;
      }

      await apiAddTrackToPlaylist(playlistId, track.id);
      const playlist = playlists.find(p => p.id === playlistId);
      setToast({ message: `"${track.title}" added to "${playlist?.name}"`, severity: "success" });
    } catch (error) {
      console.error("Error adding to playlist:", error);
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
      const newPlaylist = await apiCreatePlaylist(playlistName);
      setPlaylists([...playlists, newPlaylist]);
      setToast({ message: `Playlist "${playlistName}" created`, severity: "success" });
      setOpenCreateDialog(false);
    } catch (e) {
      setToast({ message: "Erreur création playlist", severity: "error" });
    }
  };

  // Sauvegarde des filtres
  useEffect(() => sessionStorage.setItem("playerQuery", search), [search]);
  useEffect(() => {
    if (selectedArtist) sessionStorage.setItem("selectedArtist", selectedArtist);
    else sessionStorage.removeItem("selectedArtist");
  }, [selectedArtist]);
  useEffect(() => {
    if (selectedAlbum) sessionStorage.setItem("selectedAlbum", selectedAlbum);
    else sessionStorage.removeItem("selectedAlbum");
  }, [selectedAlbum]);

  const filteredItems = items.filter(
    (track) =>
      track.title?.toLowerCase().includes(search.toLowerCase()) ||
      track.artist?.toLowerCase().includes(search.toLowerCase()) ||
      track.album?.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByArtist = filteredItems.reduce((acc, track) => {
    const artist = track.artist || "Unknown Artist";
    const album = track.album || "Unknown Album";
    if (!acc[artist]) acc[artist] = {};
    if (!acc[artist][album]) acc[artist][album] = [];
    acc[artist][album].push(track);
    return acc;
  }, {});

  const albumTracks =
    selectedArtist &&
    selectedAlbum &&
    groupedByArtist[selectedArtist]?.[selectedAlbum]
      ? groupedByArtist[selectedArtist][selectedAlbum]
      : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 12 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Ma Bibliothèque
      </Typography>

      {/* Champ recherche */}
      <TextField
        placeholder="Search by artist, album, or title..."
        variant="outlined"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: 2,
          "& .MuiOutlinedInput-root": {
            color: "#fff",
            "& fieldset": { borderColor: "#fff" },
            "&:hover fieldset": { borderColor: "#fff" },
            "&.Mui-focused fieldset": { borderColor: "#fff" },
          },
          "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 0.6 },
        }}
      />

      {/* Niveau 1 : Liste artistes */}
      {!selectedArtist && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Object.keys(groupedByArtist).map((artist) => {
            const firstAlbum = Object.values(groupedByArtist[artist])[0];
            const sampleTrack = firstAlbum?.[0];
            return (
              <Paper
                key={artist}
                onClick={() => setSelectedArtist(artist)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(29,219,84,0.1)" },
                }}
              >
                <Avatar
                  variant="rounded"
                  src={sampleTrack?.image || ""}
                  alt={artist}
                  sx={{ width: 50, height: 50 }}
                />
                <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                  {artist}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Niveau 2 : Liste albums */}
      {selectedArtist && !selectedAlbum && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{ color: "#1db954", cursor: "pointer", mb: 2 }}
            onClick={() => setSelectedArtist(null)}
          >
            ← Back to artists
          </Typography>
          {Object.keys(groupedByArtist[selectedArtist] || {}).map((albumName) => {
            const tracks = groupedByArtist[selectedArtist][albumName];
            return (
              <Paper
                key={albumName}
                onClick={() => setSelectedAlbum(albumName)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 2,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(29,219,84,0.1)" },
                }}
              >
                <Avatar
                  variant="rounded"
                  src={tracks[0]?.image || ""}
                  alt={albumName}
                  sx={{ width: 60, height: 60 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <MarqueeText text={albumName} />
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                    {selectedArtist}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Niveau 3 : Liste morceaux */}
      {albumTracks && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{ color: "#1db954", cursor: "pointer", mb: 1 }}
            onClick={() => setSelectedAlbum(null)}
          >
            ← Back to albums
          </Typography>

          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mb: 2 }}>
            {selectedAlbum}
          </Typography>

          {albumTracks.map((track, idx) => (
            <Paper
              key={track.id || `${selectedAlbum}-${idx}`}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(29,219,84,0.1)" },
                minHeight: 64,
              }}
            >
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 2, 
                  flex: 1, 
                  minWidth: 0,
                  cursor: "pointer" 
                }} 
                onClick={() => playTrack(track)}
              >
                <Avatar
                  variant="rounded"
                  src={track.image || ""}
                  alt={track.title || "Track"}
                  sx={{ width: 48, height: 48, flexShrink: 0 }}
                />
                <Box sx={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
                  <Typography sx={{ 
                    color: "#fff", 
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {track.title || "Unknown Title"}
                  </Typography>
                  <Typography sx={{ 
                    color: "rgba(255,255,255,0.7)", 
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {track.artist || "Unknown Artist"}
                  </Typography>
                </Box>
              </Box>

              {/* Boutons like + playlist */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => handleLike(track.id)} sx={{ color: likedTracks.includes(track.id) ? "#1db954" : "#fff" }}>
                  {likedTracks.includes(track.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <PlaylistMenu
                  track={track}
                  playlists={playlists.filter(p => p.id !== 'liked-songs')}
                  onAddToPlaylist={handleAddToPlaylist}
                  onToggleLike={handleLike}
                  isLiked={likedTracks.includes(track.id)}
                  onCreatePlaylist={handleCreatePlaylist}
                />
                <TrackMenu
                  track={track}
                  onPlay={playTrack}
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
