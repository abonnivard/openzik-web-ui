import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Box,
  Avatar,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import like from "../assets/like.png";
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
  apiAddRecentlyPlayed
} from "../api";

// ---------------- Utils ----------------
export async function playTrack(track) {
  sessionStorage.setItem("currentTrack", JSON.stringify(track));
  sessionStorage.setItem("isPlaying", JSON.stringify(true));
  window.dispatchEvent(new Event("storage"));

  try {
    await apiAddRecentlyPlayed(track.id);
  } catch (err) {
    console.error("Erreur ajout récemment joué :", err);
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

  const [playlists, setPlaylists] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState({});
  const [selectedPlaylist, setSelectedPlaylist] = useState(() => {
    const saved = sessionStorage.getItem("selectedPlaylist");
    return saved ? JSON.parse(saved) : null;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTrackForPlaylist, setCurrentTrackForPlaylist] = useState(null);
  const [likedTracksList, setLikedTracksList] = useState([]);

  // Dialog création playlist
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // ----- Fetch data -----
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pls = await apiGetPlaylists();
        setPlaylists(pls);

        const liked = await apiGetLikedTracks();
        setLikedTracks(liked.map(t => t.id));
        setLikedTracksList(liked.map(t => ({
          ...t,
          url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
        })));

        const tracksMap = {};
        for (let pl of pls) {
          const tracks = await apiGetPlaylistTracks(pl.id);
          tracksMap[pl.id] = tracks.map(t => ({
            ...t,
            url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
          }));
        }
        setPlaylistTracks(tracksMap);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // ----- Like / Unlike -----
  const handleLike = async (track) => {
    try {
      if (likedTracks.includes(track.id)) {
        await apiUnlikeTrack(track.id);
        setLikedTracks(likedTracks.filter(id => id !== track.id));
      } else {
        await apiLikeTrack(track.id);
        setLikedTracks([...likedTracks, track.id]);
      }
    } catch (e) { console.error(e); }
  };

  // ----- Playlist menu -----
  const handleOpenPlaylistMenu = (event, track) => {
    setAnchorEl(event.currentTarget);
    setCurrentTrackForPlaylist(track);
  };
  const handleClosePlaylistMenu = () => {
    setAnchorEl(null);
    setCurrentTrackForPlaylist(null);
  };
  const handleAddToPlaylist = async (playlistId) => {
    if (!currentTrackForPlaylist) return;
    try {
      await apiAddTrackToPlaylist(playlistId, currentTrackForPlaylist.id);
      const updated = [...(playlistTracks[playlistId] || []), currentTrackForPlaylist];
      setPlaylistTracks({ ...playlistTracks, [playlistId]: updated });
      setToast({ message: `Track ajouté à la playlist !`, severity: "success" });
      handleClosePlaylistMenu();
    } catch (e) { console.error(e); }
  };

  // ----- Créer playlist -----
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName) return;
    try {
      const newPl = await apiCreatePlaylist(newPlaylistName);
      setPlaylists([...playlists, newPl]);
      setPlaylistTracks({ ...playlistTracks, [newPl.id]: [] });
      setToast({ message: `Playlist créée : ${newPlaylistName}`, severity: "success" });
      setNewPlaylistName("");
      setOpenCreateDialog(false);
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
    } catch (e) { console.error(e); }
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
    } catch (e) { console.error(e); }
  };

  // ----- Persist selected playlist -----
  useEffect(() => {
    if (selectedPlaylist) {
      sessionStorage.setItem("selectedPlaylist", JSON.stringify(selectedPlaylist));
    } else {
      sessionStorage.removeItem("selectedPlaylist");
    }
  }, [selectedPlaylist]);

  const displayPlaylists = [
    { id: "liked", name: "Liked Tracks", tracks: likedTracksList },
    ...playlists.map(pl => ({ ...pl, tracks: playlistTracks[pl.id] || [] }))
  ];

  // ----- Render -----
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Playlists</Typography>

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
            src={pl.id === "liked" ? like : pl.tracks[0]?.image || ""}
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
          {pl.id !== "liked" && (
            <IconButton
              onClick={() => handleDeletePlaylist(pl.id)}
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
        </Paper>
      ))}

      {/* Liste des tracks d'une playlist */}
      {selectedPlaylist?.tracks && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            sx={{ color: "#1db954", cursor: "pointer" }}
            onClick={() => setSelectedPlaylist(null)}
          >
            ← Back to playlists
          </Typography>

          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, mb: 2 }}>
            {selectedPlaylist.name}
          </Typography>

          {selectedPlaylist.tracks.map((track, idx) => (
            <Paper
              key={track.id || idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(29,219,84,0.1)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }} onClick={() => playTrack(track)}>
                <Avatar
                  variant="rounded"
                  src={track.image || ""}
                  alt={track.title || "Track"}
                  sx={{ width: isMobile ? 36 : 48, height: isMobile ? 36 : 48 }}
                />
                <Box sx={{ overflow: "hidden", minWidth: 0 }}>
                  <MarqueeText text={track.title || "Unknown Title"} />
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>
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

                <IconButton
                  onClick={(e) => handleOpenPlaylistMenu(e, track)}
                  sx={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36 }}
                >
                  <PlaylistAddIcon sx={{ color: "#fff", fontSize: isMobile ? 20 : 24 }} />
                </IconButton>

                {selectedPlaylist.id !== "liked" && (
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
              </Box>
            </Paper>
          ))}

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClosePlaylistMenu}>
            {playlists.map(pl => (
              <MenuItem key={pl.id} onClick={() => handleAddToPlaylist(pl.id)}>{pl.name}</MenuItem>
            ))}
            <MenuItem onClick={() => setOpenCreateDialog(true)}>+ New playlist</MenuItem>
          </Menu>
        </Box>
      )}

      {/* Dialog création playlist */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        PaperProps={{ sx: { bgcolor: "rgba(255,255,255,0.05)", color: "#fff" } }}
      >
        <DialogTitle sx={{ color: "#fff" }}>Create a new playlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Playlist name"
            fullWidth
            variant="outlined"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            InputLabelProps={{ style: { color: "#999999ff" }, shrink: true }}
            sx={{
              input: { color: "#fff" },
              mt: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#fff" },
                "&:hover fieldset": { borderColor: "#fff" },
                "&.Mui-focused fieldset": { borderColor: "#fff" }
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} sx={{ color: "#fff" }}>Cancel</Button>
          <Button onClick={handleCreatePlaylist} variant="contained" sx={{ bgcolor: "#1db954", "&:hover": { bgcolor: "#17a44b" } }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
