import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, CircularProgress } from "@mui/material";
import TrackList from "../components/TrackList";
import ArtistList from "../components/ArtistList";
import AlbumList from "../components/AlbumList";
import { apiSearch, apiSearchLocal, apiMatchWithLocal, apiAddRecentlyPlayed, apiDownload } from "../api";

export default function Search({ setToast }) {
  const [query, setQuery] = useState(() => sessionStorage.getItem("searchQuery") || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(() => {
    const saved = sessionStorage.getItem("searchResults");
    return saved
      ? JSON.parse(saved)
      : { artists: [], albums: [], tracks: []};
  });

  // Function to play a track directly
  const handlePlayTrack = async (track) => {
    sessionStorage.setItem("currentTrack", JSON.stringify(track));
    sessionStorage.setItem("isPlaying", JSON.stringify(true));
    window.dispatchEvent(new Event("storage"));

    try {
      await apiAddRecentlyPlayed(track.id);
    } catch (err) {
      console.error("Error adding to recently played:", err);
    }
  };

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


  useEffect(() => {
    if (query && Object.values(data).every((arr) => arr.length === 0)) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
