import React, { useEffect, useState } from "react";
import { Typography, Box, Paper, Avatar, useTheme, useMediaQuery } from "@mui/material";
import { apiAddRecentlyPlayed, apiGetRecentlyPlayed, apiGetPlaylists } from "../api";
import { MarqueeText } from "./UserPlaylists"; // réutilisation du composant MarqueeText
import like from "../assets/like.png";

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

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [playlists, setPlaylists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pls = await apiGetPlaylists();
        setPlaylists(pls);

        const recent = await apiGetRecentlyPlayed();
        setRecentTracks(recent.map(t => ({
          ...t,
          url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
        })));
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handlePlayTrack = async (track) => {
    sessionStorage.setItem("currentTrack", JSON.stringify(track));
    sessionStorage.setItem("isPlaying", JSON.stringify(true));
    window.dispatchEvent(new Event("storage"));

    try {
    await apiAddRecentlyPlayed(track.id);
  } catch (err) {
    console.error("Erreur ajout récemment joué :", err);
  }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Welcome to OpenZik</Typography>

      {/* Info box */}
      <Box sx={{
        bgcolor: "rgba(255,255,255,0.05)",
        borderRadius: 2,
        p: 2
      }}>
        <Typography sx={{ color: "#fff", fontSize: "1rem", lineHeight: 1.6 }}>
          Search for Spotify artists, albums, songs, playlists and profiles, download tracks 
          and listen to your files in <b>My Library</b>.
        </Typography>
      </Box>

      {/* Récemment écoutés */}
      {recentTracks.length > 0 && (
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>Recently Played</Typography>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowX: "auto",
            pb: 1
          }}>
            {recentTracks.slice(0,5).map(track => (
              <Paper
                key={track.id}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 1,
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  "&:hover": { bgcolor: "rgba(29,219,84,0.1)" }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }} onClick={() => playTrack(track)}>
                <Avatar
                  variant="rounded"
                  src={track.image || like}
                  sx={{ width: 48, height: 48 }}
                />
                <Box sx={{ overflow: "hidden", minWidth: 0 }}>
                <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: isMobile ? "0.85rem" : "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {track.title}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: isMobile ? "0.75rem" : "0.8rem" }}>
                  {track.artist}
                </Typography>
                </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Playlists */}
      {playlists.length > 0 && (
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>Your Playlists</Typography>
          <Box sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1
          }}>
            {playlists.map(pl => (
              <Paper
                key={pl.id}
                sx={{
                  minWidth: isMobile ? 120 : 180,
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 2,
                  p: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "rgba(29,219,84,0.1)" }
                }}
              >
                <Avatar
                  variant="rounded"
                  src={pl.tracks?.[0]?.image || like}
                  sx={{ width: "100%", height: isMobile ? 100 : 140, mb: 1 }}
                />
                <MarqueeText text={pl.name} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: isMobile ? "0.75rem" : "0.8rem" }}>
                  {pl.tracks ? pl.tracks.length : 0} tracks
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
