import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Box,
  Avatar,
  TextField,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
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
    console.error("Erreur ajout récemment joué :", err);
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTrackForPlaylist, setCurrentTrackForPlaylist] = useState(null);

  // Dialog création playlist
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

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

  // Like / Unlike
  const handleLike = async (trackId) => {
    try {
      if (likedTracks.includes(trackId)) {
        await apiUnlikeTrack(trackId);
        setLikedTracks(likedTracks.filter(id => id !== trackId));
      } else {
        await apiLikeTrack(trackId);
        setLikedTracks([...likedTracks, trackId]);
      }
    } catch (e) {
      console.error("Erreur like/unlike", e);
    }
  };

  // Ajouter un track à une playlist
  const handleAddToPlaylist = async (playlistId) => {
    if (!currentTrackForPlaylist) return;
    try {
      await apiAddTrackToPlaylist(playlistId, currentTrackForPlaylist.id);
      handleClosePlaylistMenu();
      setToast({ message: `Track ajouté à la playlist !`, severity: "success" });
    } catch (e) {
      console.error("Erreur ajout track à playlist", e);
    }
  };

  // Créer une nouvelle playlist via Dialog
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName) return;
    try {
      const newPlaylist = await apiCreatePlaylist(newPlaylistName);
      setPlaylists([...playlists, newPlaylist]);
      setToast({ message: `Playlist créée : ${newPlaylistName}`, severity: "success" });
      setNewPlaylistName("");
      setOpenCreateDialog(false);
    } catch (e) {
      setToast({ message: "Erreur création playlist", severity: "error" });
    }
  };

  const handleOpenPlaylistMenu = (event, track) => {
    setAnchorEl(event.currentTarget);
    setCurrentTrackForPlaylist(track);
  };

  const handleClosePlaylistMenu = () => {
    setAnchorEl(null);
    setCurrentTrackForPlaylist(null);
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }} onClick={() => playTrack(track)}>
                <Avatar
                  variant="rounded"
                  src={track.image || ""}
                  alt={track.title || "Track"}
                  sx={{ width: 48, height: 48 }}
                />
                <Box sx={{ overflow: "hidden", minWidth: 0 }}>
                  <MarqueeText text={track.title || "Unknown Title"} />
                  <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>
                    {track.artist || "Unknown Artist"}
                  </Typography>
                </Box>
              </Box>

              {/* Boutons like + playlist */}
              <Box>
                <IconButton onClick={() => handleLike(track.id)} sx={{ color: likedTracks.includes(track.id) ? "#1db954" : "#fff" }}>
                  {likedTracks.includes(track.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <IconButton onClick={(e) => handleOpenPlaylistMenu(e, track)}>
                  <PlaylistAddIcon sx={{ color: "#fff" }} />
                </IconButton>
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
                  InputLabelProps={{ 
                    style: { color: "#999999ff" }, 
                    shrink: true // fait rester le label en haut même sans focus
                  }}
                  sx={{ 
                    input: { color: "#fff" }, 
                    mt: 1,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#fff" // contour blanc
                      },
                      "&:hover fieldset": {
                        borderColor: "#fff"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#fff"
                      }
                    }
                  }}
                />
              </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} sx={{ color: "#fff" }}>Annuler</Button>
          <Button onClick={handleCreatePlaylist} sx={{ color: "#1db954" }}>Créer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
