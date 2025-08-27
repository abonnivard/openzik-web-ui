import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  useTheme, 
  useMediaQuery, 
  Grid, 
  Card,
  CardContent,
  IconButton,
  Chip
} from "@mui/material";
import { 
  PlayArrow, 
  Favorite, 
  PushPin,
  TrendingUp,
  Person 
} from "@mui/icons-material";
import { 
  apiAddRecentlyPlayed, 
  apiGetRecentlyPlayed, 
  apiGetPlaylists,
  apiGetLikedTracks,
  apiGetTopTracks,
  apiGetRandomArtists,
  apiGetPlaylistTracks
} from "../api";
import { MarqueeText } from "./UserPlaylists";
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
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [playlists, setPlaylists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [randomArtists, setRandomArtists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(() => {
    const saved = sessionStorage.getItem("selectedPlaylist");
    return saved ? JSON.parse(saved) : null;
  });
  const [playlistTracks, setPlaylistTracks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer toutes les données en parallèle
        const [
          playlistsData,
          recentData,
          likedData,
          topTracksData,
          artistsData
        ] = await Promise.all([
          apiGetPlaylists(),
          apiGetRecentlyPlayed(),
          apiGetLikedTracks(),
          apiGetTopTracks(),
          apiGetRandomArtists(5)
        ]);

        // Récemment écoutés - distincts par track ID (on en veut au moins 6)
        const formattedRecent = recentData.map(t => ({
          ...t,
          url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
        }));
        console.log(`Tracks récents trouvés: ${formattedRecent.length}`, formattedRecent);
        
        // Garder seulement les tracks distincts (par ID), limite à 6 pour l'affichage
        const uniqueRecent = formattedRecent.filter((track, index, self) => 
          index === self.findIndex(t => t.id === track.id)
        ).slice(0, 6);
        
        setRecentTracks(uniqueRecent);

        // Récupérer les tracks pour chaque playlist pinnée
        const pinnedPlaylists = playlistsData.filter(p => p.is_pinned);
        const playlistsWithTracks = await Promise.all(
          pinnedPlaylists.map(async (playlist) => {
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
          id: 'liked-songs',
          name: 'Liked Songs',
          tracks: likedData.map(t => ({
            ...t,
            url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
          })),
          image: likedData[0]?.image || null,
          isLikedPlaylist: true
        };

        // Combiner liked playlist et pinned playlists
        const allPlaylists = [likedPlaylist, ...playlistsWithTracks];
        setPlaylists(allPlaylists);

        const formattedTop = topTracksData.map(t => ({
          ...t,
          url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
        }));
        setTopTracks(formattedTop);

        setRandomArtists(artistsData);
      } catch (e) {
        console.error("Erreur chargement données:", e);
      }
    };
    fetchData();
  }, []);

  // Recharger les tracks de la playlist sélectionnée si elle existe dans sessionStorage
  useEffect(() => {
    const loadSelectedPlaylistTracks = async () => {
      if (selectedPlaylist) {
        if (selectedPlaylist.isLikedPlaylist) {
          // Recharger les liked tracks si c'est la playlist liked
          try {
            const likedData = await apiGetLikedTracks();
            const formattedLiked = likedData.map(t => ({
              ...t,
              url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
            }));
            setPlaylistTracks(formattedLiked);
            setSelectedPlaylist({ ...selectedPlaylist, tracks: formattedLiked });
          } catch (error) {
            console.error('Erreur rechargement liked tracks:', error);
          }
        } else if (selectedPlaylist.id) {
          // Recharger les tracks de la playlist depuis l'API
          try {
            const tracks = await apiGetPlaylistTracks(selectedPlaylist.id);
            const formattedTracks = tracks.map(t => ({
              ...t,
              url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
            }));
            setPlaylistTracks(formattedTracks);
            setSelectedPlaylist({ ...selectedPlaylist, tracks: formattedTracks });
          } catch (error) {
            console.error('Erreur rechargement tracks playlist:', error);
            // Si erreur, reset la playlist sélectionnée
            setSelectedPlaylist(null);
            setPlaylistTracks([]);
          }
        }
      }
    };

    // Attendre que les données initiales soient chargées avant de charger la playlist
    if (playlists.length > 0 || recentTracks.length > 0) {
      loadSelectedPlaylistTracks();
    }
  }, [playlists, recentTracks]); // Déclencher après le chargement initial

  const handlePlayTrack = async (track) => {
    await playTrack(track);
  };

  const handlePlaylistClick = async (playlist) => {
    console.log('Playlist clicked:', playlist);
    setSelectedPlaylist(playlist);
    if (playlist.isLikedPlaylist) {
      // Utiliser les tracks déjà chargés pour Liked Songs
      const updatedPlaylist = { ...playlist, tracks: playlist.tracks };
      setSelectedPlaylist(updatedPlaylist);
      setPlaylistTracks(playlist.tracks);
    } else {
      // Charger les tracks de la playlist depuis l'API si pas déjà fait
      if (!playlist.tracks || playlist.tracks.length === 0) {
        try {
          const tracks = await apiGetPlaylistTracks(playlist.id);
          const formattedTracks = tracks.map(t => ({
            ...t,
            url: `http://localhost:3000/${t.file_path.split(/[\\/]/).map(encodeURIComponent).join("/")}`
          }));
          const updatedPlaylist = { ...playlist, tracks: formattedTracks };
          setSelectedPlaylist(updatedPlaylist);
          setPlaylistTracks(formattedTracks);
        } catch (error) {
          console.error('Erreur chargement tracks playlist:', error);
          setPlaylistTracks([]);
        }
      } else {
        const updatedPlaylist = { ...playlist, tracks: playlist.tracks };
        setSelectedPlaylist(updatedPlaylist);
        setPlaylistTracks(playlist.tracks);
      }
    }
  };

  const handleBackToHome = () => {
    setSelectedPlaylist(null);
    setPlaylistTracks([]);
  };

  // Persist selected playlist in sessionStorage
  useEffect(() => {
    if (selectedPlaylist) {
      sessionStorage.setItem("selectedPlaylist", JSON.stringify(selectedPlaylist));
    } else {
      sessionStorage.removeItem("selectedPlaylist");
    }
  }, [selectedPlaylist]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 10 }}>
      {/* Vue Playlist détaillée */}
      {selectedPlaylist ? (
        <Box>
          {/* Header de la playlist */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{ color: "#1db954", cursor: "pointer", mb: 2, fontSize: "0.9rem" }}
              onClick={handleBackToHome}
            >
              ← Back to Home
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar
                variant="rounded"
                src={selectedPlaylist.isLikedPlaylist ? like : (playlistTracks[0]?.image || like)}
                sx={{ 
                  width: isMobile ? 80 : 120, 
                  height: isMobile ? 80 : 120,
                  border: selectedPlaylist.isLikedPlaylist ? "2px solid #1db954" : "none"
                }}
              />
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
                  {playlistTracks.length} tracks
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Liste des tracks de la playlist */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {playlistTracks.map((track, index) => (
              <Paper
                key={track.id}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 1,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { 
                    bgcolor: "rgba(29,219,84,0.1)",
                    transform: "translateY(-1px)"
                  }
                }}
                onClick={() => handlePlayTrack(track)}
              >
                <Typography sx={{ 
                  color: "rgba(255,255,255,0.5)", 
                  fontWeight: 600,
                  minWidth: 30,
                  textAlign: "center"
                }}>
                  {index + 1}
                </Typography>
                <Avatar
                  variant="rounded"
                  src={track.image || like}
                  sx={{ width: 48, height: 48 }}
                />
                <Box sx={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
                  <Typography sx={{ 
                    color: "#fff", 
                    fontWeight: 600, 
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:hover": {
                      animation: track.title.length > 30 ? "scrollText 3s linear infinite" : "none"
                    },
                    "@keyframes scrollText": {
                      "0%": { transform: "translateX(0)" },
                      "50%": { transform: `translateX(-${Math.max(0, (track.title.length - 30) * 8)}px)` },
                      "100%": { transform: "translateX(0)" }
                    }
                  }}>
                    {track.title}
                  </Typography>
                  <Typography sx={{ 
                    color: "rgba(255,255,255,0.7)", 
                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:hover": {
                      animation: track.artist.length > 25 ? "scrollText 3s linear infinite" : "none"
                    },
                    "@keyframes scrollText": {
                      "0%": { transform: "translateX(0)" },
                      "50%": { transform: `translateX(-${Math.max(0, (track.artist.length - 25) * 8)}px)` },
                      "100%": { transform: "translateX(0)" }
                    }
                  }}>
                    {track.artist}
                  </Typography>
                </Box>
                <IconButton 
                  sx={{ color: "#1db954" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track);
                  }}
                >
                  <PlayArrow />
                </IconButton>
              </Paper>
            ))}
          </Box>
        </Box>
      ) : (
        /* Vue Home normale */
        <>
          {/* Header */}
          <Box>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{ fontWeight: 700, color: "#fff", mb: 1 }}
            >
              Welcome to OpenZik
            </Typography>
            <Box sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              p: 2
            }}>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                Search for Spotify artists, albums, songs, playlists and profiles, download tracks 
                and listen to your files in <b>My Library</b>.
              </Typography>
            </Box>
          </Box>

      {/* 6 derniers titres écoutés distincts - 2 colonnes de 3 lignes */}
      {recentTracks.length > 0 && (
        <Box>
          <Typography sx={{ 
            color: "#fff", 
            fontWeight: 600, 
            mb: 2,
            fontSize: isMobile ? "1.1rem" : "1.25rem"
          }}>
            🎵 Recently Played ({recentTracks.length})
          </Typography>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 1,
            width: "100%"
          }}>
            {recentTracks.map((track, index) => (
              <Paper
                key={`${track.id}-${index}`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 1,
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  minHeight: 72,
                  "&:hover": { 
                    bgcolor: "rgba(29,219,84,0.1)",
                    transform: "scale(1.02)"
                  }
                }}
                onClick={() => handlePlayTrack(track)}
              >
                <Avatar
                  variant="rounded"
                  src={track.image || like}
                  sx={{ 
                    width: isMobile ? 40 : 48, 
                    height: isMobile ? 40 : 48,
                    flexShrink: 0
                  }}
                />
                <Box sx={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
                  <Typography sx={{ 
                    color: "#fff", 
                    fontWeight: 500, 
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:hover": {
                      animation: track.title.length > 30 ? "scrollText 3s linear infinite" : "none"
                    },
                    "@keyframes scrollText": {
                      "0%": { transform: "translateX(0)" },
                      "50%": { transform: `translateX(-${Math.max(0, (track.title.length - 30) * 8)}px)` },
                      "100%": { transform: "translateX(0)" }
                    }
                  }}>
                    {track.title}
                  </Typography>
                  <Typography sx={{ 
                    color: "rgba(255,255,255,0.6)", 
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:hover": {
                      animation: track.artist.length > 25 ? "scrollText 3s linear infinite" : "none"
                    },
                    "@keyframes scrollText": {
                      "0%": { transform: "translateX(0)" },
                      "50%": { transform: `translateX(-${Math.max(0, (track.artist.length - 25) * 8)}px)` },
                      "100%": { transform: "translateX(0)" }
                    }
                  }}>
                    {track.artist}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Section Playlists unifiée - Liked Songs + Pinned Playlists */}
      {playlists.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Favorite sx={{ color: "#1db954", mr: 1, fontSize: "1.5rem" }} />
            <Typography sx={{ 
              color: "#fff", 
              fontWeight: 600,
              fontSize: isMobile ? "1.1rem" : "1.25rem"
            }}>
              Your Playlists
            </Typography>
          </Box>
          <Box sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255,255,255,0.1)",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#1db954",
              borderRadius: 4,
            },
          }}>
            {playlists.map((playlist) => (
              <Box
                key={playlist.id}
                sx={{
                  minWidth: isMobile ? 140 : 180,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" }
                }}
                onClick={() => handlePlaylistClick(playlist)}
              >
                <Paper
                  sx={{
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderRadius: 2,
                    p: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s",
                    "&:hover": { bgcolor: "rgba(29,219,84,0.1)" }
                  }}
                >
                  <Avatar
                    variant="rounded"
                    src={
                      playlist.isLikedPlaylist 
                        ? like
                        : (playlist.tracks?.[0]?.image)
                    }
                    sx={{ 
                      width: "100%", 
                      height: isMobile ? 120 : 140, 
                      mb: 1.5,
                      border: playlist.isLikedPlaylist ? "2px solid #1db954" : "none"
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      {playlist.isLikedPlaylist && (
                        <Favorite sx={{ color: "#1db954", fontSize: "1rem" }} />
                      )}
                      {playlist.is_pinned && !playlist.isLikedPlaylist && (
                        <PushPin sx={{ color: "#1db954", fontSize: "1rem" }} />
                      )}
                      <Typography sx={{ 
                        color: "#fff", 
                        fontWeight: 600, 
                        fontSize: isMobile ? "0.85rem" : "0.95rem",
                        overflow: "hidden", 
                        textOverflow: "ellipsis", 
                        whiteSpace: "nowrap",
                        flex: 1
                      }}>
                        {playlist.name}
                      </Typography>
                    </Box>
                    <Typography sx={{ 
                      color: "rgba(255,255,255,0.7)", 
                      fontSize: isMobile ? "0.75rem" : "0.8rem"
                    }}>
                      {playlist.tracks ? playlist.tracks.length : 0} tracks
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Top 5 des sons les plus écoutés */}
      {topTracks.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TrendingUp sx={{ color: "#1db954", mr: 1, fontSize: "1.5rem" }} />
            <Typography sx={{ 
              color: "#fff", 
              fontWeight: 600,
              fontSize: isMobile ? "1.1rem" : "1.25rem"
            }}>
              Your Top Tracks
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {topTracks.map((track, index) => (
              <Paper
                key={track.id}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: 1,
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": { 
                    bgcolor: "rgba(29,219,84,0.1)",
                    transform: "translateY(-1px)"
                  }
                }}
                onClick={() => handlePlayTrack(track)}
              >
                <Chip 
                  label={`#${index + 1}`} 
                  sx={{ 
                    bgcolor: "#1db954", 
                    color: "#000", 
                    fontWeight: 400,
                    minWidth: 20
                  }} 
                />
                <Avatar
                  variant="rounded"
                  src={track.image || like}
                  sx={{ width: 48, height: 48 }}
                />
                <Box sx={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
                  <Typography sx={{ 
                    color: "#fff", 
                    fontWeight: 600, 
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:hover": {
                      animation: track.title.length > 30 ? "scrollText 3s linear infinite" : "none"
                    },
                    "@keyframes scrollText": {
                      "0%": { transform: "translateX(0)" },
                      "50%": { transform: `translateX(-${Math.max(0, (track.title.length - 30) * 8)}px)` },
                      "100%": { transform: "translateX(0)" }
                    }
                  }}>
                    {track.title}
                  </Typography>
                  <Typography sx={{ 
                    color: "rgba(255,255,255,0.7)", 
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    "&:hover": {
                      animation: track.artist.length > 25 ? "scrollText 3s linear infinite" : "none"
                    },
                    "@keyframes scrollText": {
                      "0%": { transform: "translateX(0)" },
                      "50%": { transform: `translateX(-${Math.max(0, (track.artist.length - 25) * 8)}px)` },
                      "100%": { transform: "translateX(0)" }
                    }
                  }}>
                    {track.artist}
                  </Typography>
                </Box>
                <Typography sx={{ 
                  color: "rgba(255,255,255,0.5)", 
                  fontSize: "0.75rem",
                  textAlign: "right"
                }}>
                  {track.play_count} plays
                </Typography>
                <IconButton 
                  sx={{ color: "#1db954" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTrack(track);
                  }}
                >
                </IconButton>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Artistes aléatoires */}
      {randomArtists.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Person sx={{ color: "#1db954", mr: 1, fontSize: "1.5rem" }} />
            <Typography sx={{ 
              color: "#fff", 
              fontWeight: 600,
              fontSize: isMobile ? "1.1rem" : "1.25rem"
            }}>
              Artists to Discover
            </Typography>
          </Box>
          <Box sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255,255,255,0.1)",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#1db954",
              borderRadius: 4,
            },
          }}>
            {randomArtists.map((artist, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: isMobile ? 100 : 120,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.05)" }
                }}
              >
                <Avatar
                  src={artist.image || like}
                  sx={{ 
                    width: isMobile ? 80 : 100, 
                    height: isMobile ? 80 : 100,
                    mx: "auto",
                    mb: 1,
                    border: "2px solid rgba(29,185,84,0.3)"
                  }}
                />
                <Typography sx={{ 
                  color: "#fff", 
                  fontWeight: 500, 
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap",
                  px: 1
                }}>
                  {artist.artist}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
        </>
      )}
    </Box>
  );
}
