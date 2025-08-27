import React, { useState, useEffect } from "react";
import { CircularProgress, Box, Typography, TextField } from "@mui/material";
import ArtistList from "../components/ArtistList";
import AlbumList from "../components/AlbumList";
import TrackList from "../components/TrackList";
import PlaylistList from "../components/PlaylistList";
import UserList from "../components/UserList";
import { apiSearch, apiDownload } from "../api";

export default function Search({ setToast }) {
  const [query, setQuery] = useState(() => sessionStorage.getItem("searchQuery") || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(() => {
    const saved = sessionStorage.getItem("searchResults");
    return saved
      ? JSON.parse(saved)
      : { artists: [], albums: [], tracks: [], playlists: [], users: [] };
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
        playlists: res.playlists || [],
        users: res.users || [],
      });
      sessionStorage.setItem("searchQuery", query);
      sessionStorage.setItem("searchResults", JSON.stringify(res));
      setToast({ message: "Recherche terminée ✅", severity: "success" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Erreur lors de la recherche ❌", severity: "error" });
    }
    setLoading(false);
  };

  const handleDownload = async (album) => {
    try {
      await apiDownload(album);
      setToast({ message: "Téléchargement lancé ✅", severity: "success" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Erreur lors du téléchargement ❌", severity: "error" });
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ArtistList artists={data.artists} />
          <AlbumList albums={data.albums} onDownload={handleDownload} />
          <TrackList tracks={data.tracks} onDownload={handleDownload} />
          <PlaylistList playlists={data.playlists} />
          <UserList users={data.users} />
        </Box>
      )}
    </Box>
  );
}
