import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, CircularProgress, Avatar, Paper, useTheme, useMediaQuery } from "@mui/material";
import TrackList from "../components/TrackList";
import ArtistList from "../components/ArtistList";
import AlbumList from "../components/AlbumList";
import TrackItem from "../components/TrackItem";
import { 
  apiSearch, 
  apiSearchLocal, 
  apiMatchWithLocal, 
  apiAddRecentlyPlayed, 
  apiDownload,
  apiGetPlaylists,
  apiGetLikedTracks,
  apiAddTrackToPlaylist,
  apiLikeTrack,
  apiUnlikeTrack,
  apiCreatePlaylist
} from "../api";
import like from "../assets/like.png";

export default function Search({ setToast }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [query, setQuery] = useState(() => sessionStorage.getItem("searchQuery") || "");
  const [loading, setLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [data, setData] = useState(() => {
    const saved = sessionStorage.getItem("searchResults");
    return saved
      ? JSON.parse(saved)
      : { artists: [], albums: [], tracks: []};
  });



const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await apiSearch(query);
      setData({
        artists: res.artists || [],
        albums: res.albums || [],
        tracks: res.tracks || [],
      });
      sessionStorage.setItem("searchQuery", query);
      sessionStorage.setItem("searchResults", JSON.stringify(res));
    } catch (e) {
      console.error(e);
      setToast({ message: "Error during search ❌", severity: "error" });
    }
    setLoading(false);
  };

  const handleDownload = async (album) => {
    try {
      await apiDownload(album);
      setToast({ message: "Download launched ✅", severity: "success" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Error during download ❌", severity: "error" });
    }
  };

  const handleAlbumClick = (album) => {
    // Only allow click if album is local (available)
    if (album.local) {
      setSelectedAlbum(album);
      // If album has localTracks, use them, otherwise use tracks
      const tracks = album.localTracks || album.tracks || [];
      setAlbumTracks(tracks);
    }
  };

  const handleBackToSearch = () => {
    setSelectedAlbum(null);
    setAlbumTracks([]);
  };

  // Handle like/unlike tracks
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
      await apiAddTrackToPlaylist(playlistId, track.id);
      const playlist = allPlaylists.find(p => p.id === playlistId);
      
      if (setToast) {
        setToast({ message: `"${track.title}" added to "${playlist?.name}"`, severity: "success" });
      }
    } catch (error) {
      console.error("Error adding to playlist:", error);
      if (setToast) {
        setToast({ message: "Error adding to playlist", severity: "error" });
      }
    }
  };

  // Handle create new playlist
  const handleCreatePlaylist = async (playlistName) => {
    try {
      const newPlaylist = await apiCreatePlaylist(playlistName);
      setAllPlaylists(prev => [...prev, newPlaylist]);
      
      if (setToast) {
        setToast({ message: `Playlist "${playlistName}" created`, severity: "success" });
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      if (setToast) {
        setToast({ message: "Error creating playlist", severity: "error" });
      }
    }
  };


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [playlistsData, likedData] = await Promise.all([
          apiGetPlaylists(),
          apiGetLikedTracks()
        ]);
        
        setAllPlaylists(playlistsData);
        setLikedTracks(likedData.map(t => t.id));
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (query && Object.values(data).every((arr) => arr.length === 0)) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If an album is selected, show album details
  if (selectedAlbum) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 12 }}>
        {/* Vue Album détaillée */}
        <Box>
          {/* Header de l'album */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{ color: "#1db954", cursor: "pointer", mb: 2, fontSize: "0.9rem" }}
              onClick={handleBackToSearch}
            >
              ← Back to Search
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar
                variant="rounded"
                src={selectedAlbum.images?.[0]?.url || like}
                sx={{ 
                  width: isMobile ? 80 : 120, 
                  height: isMobile ? 80 : 120,
                }}
              />
              <Box>
                <Typography sx={{ 
                  color: "#fff", 
                  fontWeight: 700, 
                  fontSize: isMobile ? "1.5rem" : "2rem",
                  mb: 1
                }}>
                  {selectedAlbum.name}
                </Typography>
                <Typography sx={{ 
                  color: "rgba(255,255,255,0.7)", 
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  mb: 1
                }}>
                  {selectedAlbum.artist || selectedAlbum.artists?.map((a) => a.name).join(", ")}
                </Typography>
                <Typography sx={{ 
                  color: "rgba(255,255,255,0.7)", 
                  fontSize: isMobile ? "0.8rem" : "0.9rem"
                }}>
                  {albumTracks.length} tracks available
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Liste des tracks de l'album */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TrackList
              tracks={
                albumTracks.map(track => ({
                  ...track,
                  local: true
                }))
              }
              displayAlbum={true}
              setToast={setToast}
              playlists={allPlaylists.filter(p => p.id !== 'liked')}
              likedTracks={likedTracks}
              onAddToPlaylist={handleAddToPlaylist}
              onToggleLike={handleLike}
              onCreatePlaylist={handleCreatePlaylist}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pb: 12
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Search
      </Typography>

      <TextField
        placeholder="Search by artist, album, or title..."
        variant="outlined"
        size="small"
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        sx={{
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: 2,
          "& .MuiOutlinedInput-root": {
            color: "#fff", // ✅ texte en blanc
            "& fieldset": { borderColor: "#fff" },
            "&:hover fieldset": { borderColor: "#fff" },
            "&.Mui-focused fieldset": { borderColor: "#fff" },
          },
          "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 0.6 },
        }}
      />


      {loading ? (
        <CircularProgress sx={{ color: "#1db954", alignSelf: "center", mt: 3 }} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <ArtistList artists={data.artists} />
            </Box>

            <Box>
              <AlbumList 
                albums={data.albums} 
                onDownload={handleDownload}
                onAlbumClick={handleAlbumClick}
                setToast={setToast}
              />
            </Box>
            <Box>
              <TrackList
                tracks={data.tracks}
                setToast={setToast}
              />
            </Box>
        </Box>
      )}
    </Box>
  );
}
