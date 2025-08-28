import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import RepeatIcon from "@mui/icons-material/Repeat";
import RepeatOneIcon from "@mui/icons-material/RepeatOne";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import { apiLikeTrack, apiUnlikeTrack, apiGetLikedTracks } from "../api";
import PlaylistMenu from "./PlaylistMenu";

export default function Player() {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [library, setLibrary] = useState([]);
  const [queue, setQueue] = useState([]); // Queue
  const [likedTracks, setLikedTracks] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // off | all | one
  const [openMobile, setOpenMobile] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Load queue from sessionStorage
  useEffect(() => {
    const savedQueue = JSON.parse(sessionStorage.getItem("musicQueue") || "[]");
    setQueue(savedQueue);
  }, []);

  // Save queue to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem("musicQueue", JSON.stringify(queue));
  }, [queue]);

  // Function to add a track to queue
  const addToQueue = useCallback((track) => {
    // Include current playlist as context to return after queue
    const currentPlaylist = JSON.parse(sessionStorage.getItem("selectedPlaylist") || "null");
    const trackWithContext = {
      ...track,
      fromPlaylist: currentPlaylist
    };
    setQueue(prev => [...prev, trackWithContext]);
  }, []);

  // Expose addToQueue function globally
  useEffect(() => {
    window.addToQueue = addToQueue;
    return () => {
      delete window.addToQueue;
    };
  }, [addToQueue]);

  // Load liked tracks
  useEffect(() => {
    const fetchLikedTracks = async () => {
      try {
        const liked = await apiGetLikedTracks();
        setLikedTracks(liked.map(t => t.id));
      } catch (error) {
        console.error("Error loading liked tracks:", error);
      }
    };
    
    fetchLikedTracks();

    // Listen for liked tracks changes from other components
    const handleLikedTracksChanged = () => {
      fetchLikedTracks();
    };

    window.addEventListener('likedTracksChanged', handleLikedTracksChanged);
    return () => {
      window.removeEventListener('likedTracksChanged', handleLikedTracksChanged);
    };
  }, []);

  // Handle like/unlike
  const handleLike = useCallback(async (trackId) => {
    try {
      if (likedTracks.includes(trackId)) {
        await apiUnlikeTrack(trackId);
        setLikedTracks(prev => prev.filter(id => id !== trackId));
      } else {
        await apiLikeTrack(trackId);
        setLikedTracks(prev => [...prev, trackId]);
      }
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('likedTracksChanged'));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }, [likedTracks]);

  // Charger la library depuis la playlist en cours si existante
  useEffect(() => {
    const selectedPlaylist = JSON.parse(sessionStorage.getItem("selectedPlaylist") || "null");
    if (selectedPlaylist?.tracks) {
      setLibrary(selectedPlaylist.tracks);
    } else {
      const lib = JSON.parse(sessionStorage.getItem("library") || "[]");
      setLibrary(lib);
    }
  }, []);

  // Mettre à jour la library si la playlist change
  useEffect(() => {
    const updateLibrary = () => {
      const selectedPlaylist = JSON.parse(sessionStorage.getItem("selectedPlaylist") || "null");
      if (selectedPlaylist?.tracks) {
        setLibrary(selectedPlaylist.tracks);
      }
    };
    window.addEventListener("storage", updateLibrary);
    return () => window.removeEventListener("storage", updateLibrary);
  }, []);

  // Charger le track actuel depuis sessionStorage
  useEffect(() => {
    const updateTrack = () => {
      const track = JSON.parse(sessionStorage.getItem("currentTrack") || "null");
      setCurrentTrack(track);
      const playing = JSON.parse(sessionStorage.getItem("isPlaying") || "false");
      setIsPlaying(playing);
    };
    updateTrack();
    window.addEventListener("storage", updateTrack);
    return () => window.removeEventListener("storage", updateTrack);
  }, []);

const handleNext = useCallback(() => {
  if (!currentTrack) return;

  // Check if there are tracks in the queue
  if (queue.length > 0) {
    const nextTrack = queue[0];
    const isLastInQueue = queue.length === 1;
    
    // If it's the last track in queue and had an origin playlist,
    // prepare to restore that playlist after this track plays
    if (isLastInQueue && nextTrack.fromPlaylist) {
      console.log("Last track in queue, will restore playlist:", nextTrack.fromPlaylist.name);
      // Store the playlist to restore after this track
      sessionStorage.setItem("playlistToRestore", JSON.stringify(nextTrack.fromPlaylist));
    }
    
    setQueue(prev => prev.slice(1)); // Remove first track from queue
    setCurrentTrack(nextTrack);
    sessionStorage.setItem("currentTrack", JSON.stringify(nextTrack));
    setProgress(0);
    return;
  }

  // Check if we need to restore a playlist after queue is empty
  const playlistToRestore = JSON.parse(sessionStorage.getItem("playlistToRestore") || "null");
  if (playlistToRestore) {
    console.log("Restoring playlist after queue:", playlistToRestore.name);
    sessionStorage.setItem("selectedPlaylist", JSON.stringify(playlistToRestore));
    sessionStorage.removeItem("playlistToRestore");
    setLibrary(playlistToRestore.tracks || []);
    window.dispatchEvent(new Event("storage"));
    
    // Continue with first track of restored playlist
    if (playlistToRestore.tracks && playlistToRestore.tracks.length > 0) {
      const firstTrack = playlistToRestore.tracks[0];
      setCurrentTrack(firstTrack);
      sessionStorage.setItem("currentTrack", JSON.stringify(firstTrack));
      setProgress(0);
      return;
    }
  }

  // If no queue, continue with normal logic
  if (library.length === 0) return;

  const idx = library.findIndex((t) => t.file_path === currentTrack.file_path);

  let nextTrack = null;
  if (isShuffle) {
    const randomIdx = Math.floor(Math.random() * library.length);
    nextTrack = library[randomIdx];
  } else if (idx !== -1 && idx + 1 < library.length) {
    nextTrack = library[idx + 1];
  } else if (repeatMode === "all") {
    nextTrack = library[0];
  }

  if (nextTrack) {
    setCurrentTrack(nextTrack);
    sessionStorage.setItem("currentTrack", JSON.stringify(nextTrack));
    setProgress(0);
  } else {
    setIsPlaying(false);
  }
}, [currentTrack, library, queue, isShuffle, repeatMode]);

const handlePrev = useCallback(() => {
  if (!currentTrack || library.length === 0) return;

  const idx = library.findIndex((t) => t.file_path === currentTrack.file_path);
  if (idx > 0) {
    const prevTrack = library[idx - 1];
    setCurrentTrack(prevTrack);
    sessionStorage.setItem("currentTrack", JSON.stringify(prevTrack));
    setProgress(0);
  } else if (audioRef.current) {
    audioRef.current.currentTime = 0;
  }
}, [currentTrack, library]);


  const togglePlay = () => setIsPlaying((prev) => !prev);
  const toggleShuffle = () => setIsShuffle((prev) => !prev);
  const toggleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  const handleSeek = (_, value) => {
    if (audioRef.current && !isNaN(value)) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  useEffect(() => {
    const selectedPlaylist = JSON.parse(sessionStorage.getItem("selectedPlaylist") || "null");
    if (!selectedPlaylist) {
      const lib = JSON.parse(sessionStorage.getItem("library") || "[]");
      setLibrary(lib);
    }
  }, [currentTrack]);


  const lastTrackRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (lastTrackRef.current !== currentTrack.file_path) {
      audio.src = currentTrack.url || "";
      lastTrackRef.current = currentTrack.file_path;
      setProgress(0);
      setDuration(0);
    }

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    if (isPlaying) audio.play().catch(() => {});

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, isPlaying, repeatMode, handleNext]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  if (!currentTrack) return null;

  // === Desktop ===
  if (!isMobile) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "rgba(20,20,20,0.95)",
          p: 2,
          px: 3,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          width: "100%",
          boxSizing: "border-box",
          gap: 3,
        }}
      >
        {/* Left section - Track info */}
        <Box sx={{ display: "flex", alignItems: "center", flex: "0 1 30%", minWidth: 0 }}>
          <Avatar
            src={currentTrack.image || ""}
            alt={currentTrack.title}
            variant="rounded"
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 600, fontSize: "1rem" }}>
              {currentTrack.title}
            </Typography>
            <Typography noWrap sx={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
              {currentTrack.artist}
            </Typography>
          </Box>
        </Box>

        {/* Center section - Player controls */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 40%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <IconButton onClick={toggleShuffle} sx={{ color: isShuffle ? "#1db954" : "rgba(255,255,255,0.7)" }}>
              <ShuffleIcon />
            </IconButton>
            <IconButton onClick={handlePrev} sx={{ color: "#fff" }}>
              <SkipPreviousIcon />
            </IconButton>
            <IconButton 
              onClick={togglePlay} 
              sx={{ 
                color: "#000", 
                bgcolor: "#1db954",
                width: 40,
                height: 40,
                "&:hover": { bgcolor: "#1ed760", transform: "scale(1.05)" }
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={handleNext} sx={{ color: "#fff" }}>
              <SkipNextIcon />
            </IconButton>
            <IconButton onClick={toggleRepeat} sx={{ color: repeatMode !== "off" ? "#1db954" : "rgba(255,255,255,0.7)" }}>
              {repeatMode === "one" ? <RepeatOneIcon /> : <RepeatIcon />}
            </IconButton>
          </Box>
          
          {/* Progress bar */}
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", minWidth: "40px" }}>
              {Math.floor(progress / 60)}:{("0" + Math.floor(progress % 60)).slice(-2)}
            </Typography>
            <Slider
              value={progress}
              max={duration}
              onChange={handleSeek}
              sx={{
                color: "#1db954",
                height: 4,
                flex: 1,
                "& .MuiSlider-thumb": { width: 14, height: 14 },
                "& .MuiSlider-rail": { opacity: 0.3 },
              }}
            />
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", minWidth: "40px" }}>
              {Math.floor(duration / 60)}:{("0" + Math.floor(duration % 60)).slice(-2)}
            </Typography>
          </Box>
        </Box>

        {/* Right section - Action buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: "0 1 30%", justifyContent: "flex-end" }}>
          <IconButton 
            onClick={() => currentTrack && handleLike(currentTrack.id)} 
            sx={{ color: currentTrack && likedTracks.includes(currentTrack.id) ? "#1db954" : "rgba(255,255,255,0.7)" }}
          >
            {currentTrack && likedTracks.includes(currentTrack.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          
        </Box>
        
        <audio ref={audioRef} />
      </Box>
    );
  }

  // === Mobile mini-player ===
  return (
    <>
      <Box
        sx={{
          width: "100%",
          bgcolor: "rgba(20,20,20,0.95)",
          position: "fixed",
          bottom: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          px: 2,
          py: 1.5,
          mb: 5, // Space for bottom navigation
          backdropFilter: "blur(10px)",
          zIndex: 1000,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", cursor: "pointer" }}
             onClick={() => setOpenMobile(true)}
        >
          <Avatar src={currentTrack.image || ""} alt={currentTrack.title} variant="rounded" sx={{ width: 40, height: 40 }} />
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <Typography noWrap sx={{ color: "#fff", fontWeight: 600, fontSize: "0.8rem" }}>{currentTrack.title}</Typography>
            <Typography noWrap sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.65rem" }}>{currentTrack.artist}</Typography>
          </Box>
          
          {/* Mini player buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton 
              onClick={(e) => { 
                e.stopPropagation(); 
                currentTrack && handleLike(currentTrack.id); 
              }} 
              sx={{ 
                color: currentTrack && likedTracks.includes(currentTrack.id) ? "#1db954" : "rgba(255,255,255,0.7)",
                p: 1
              }}
              size="small"
            >
              {currentTrack && likedTracks.includes(currentTrack.id) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </IconButton>
            
            
            <IconButton 
              onClick={(e) => { 
                e.stopPropagation(); 
                togglePlay(); 
              }} 
              sx={{ 
                color: "#000", 
                bgcolor: "#1db954",
                width: 36,
                height: 36,
                ml: 0.5,
                "&:hover": { bgcolor: "#1ed760" }
              }}
            >
              {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ width: "100%", mt: 1 }}>
          <Slider value={progress} max={duration} onChange={handleSeek} sx={{
            color: "#1db954",
            height: 3,
            "& .MuiSlider-thumb": { width: 12, height: 12 },
            "& .MuiSlider-rail": { height: 3, opacity: 0.3, bgcolor: "rgba(255,255,255,0.3)" },
            "& .MuiSlider-track": { height: 3 },
          }} />
        </Box>
      </Box>

      {/* === Expanded Mobile Player === */}
      {openMobile && (
        <Box sx={{
          position: "fixed",
          left: 0,
          top: 56, // Hauteur de la barre du haut
          right: 0,
          bottom: 56, // Hauteur de la navbar du bas
          bgcolor: "#121212",
          color: "#fff",
          zIndex: 1100,
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          transform: openMobile ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s ease",
        }}>
          <IconButton onClick={() => setOpenMobile(false)} sx={{ alignSelf: "flex-end", color: "#fff", fontSize: "2rem", mb: 1 }}>
            <CloseIcon fontSize="large" />
          </IconButton>
          
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "flex-start", gap: 2, mt: 2 }}>
            <Avatar 
              src={currentTrack.image || ""} 
              alt={currentTrack.title} 
              variant="rounded" 
              sx={{ 
                width: { xs: 300, sm: 350 }, 
                height: { xs: 300, sm: 350 }, 
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
              }} 
            />
            
            <Box sx={{ textAlign: "center", width: "100%", mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, fontSize: "1.3rem" }}>
                {currentTrack.title}
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem" }}>
                {currentTrack.artist}
              </Typography>
            </Box>
            
            <Box sx={{ width: "100%", px: 2, mb:2 }}>
              <Slider 
                value={progress} 
                max={duration} 
                onChange={handleSeek} 
                sx={{ 
                  color: "#1db954", 
                  width: "100%", 
                  mb: 0,
                  height: 6,
                  "& .MuiSlider-thumb": { width: 20, height: 20 },
                  "& .MuiSlider-track": { height: 6 },
                  "& .MuiSlider-rail": { height: 6, opacity: 0.3 }
                }} 
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                  {Math.floor(progress / 60)}:{("0" + Math.floor(progress % 60)).slice(-2)}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                  {Math.floor(duration / 60)}:{("0" + Math.floor(duration % 60)).slice(-2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bottom action buttons */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-around", 
            width: "100%", 
            maxWidth: 400,
            px: 2,
            mb: 2
          }}>
            <IconButton 
              onClick={() => currentTrack && handleLike(currentTrack.id)} 
              sx={{ 
                color: currentTrack && likedTracks.includes(currentTrack.id) ? "#1db954" : "rgba(255,255,255,0.7)",
                fontSize: "2rem"
              }}
            >
              {currentTrack && likedTracks.includes(currentTrack.id) ? <FavoriteIcon fontSize="large" /> : <FavoriteBorderIcon fontSize="large" />}
            </IconButton>
          
          </Box>

          {/* Main control buttons */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, mb: 10 }}>
            <IconButton onClick={toggleShuffle} sx={{ color: isShuffle ? "#1db954" : "rgba(255,255,255,0.7)", fontSize: "2rem" }}>
              <ShuffleIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={handlePrev} sx={{ color: "#fff", fontSize: "2.5rem" }}>
              <SkipPreviousIcon fontSize="inherit" />
            </IconButton>
            <IconButton 
              onClick={togglePlay} 
              sx={{ 
                color: "#000", 
                bgcolor: "#1db954",
                fontSize: "3rem",
                width: 70,
                height: 70,
                "&:hover": { bgcolor: "#1ed760" }
              }}
            >
              {isPlaying ? <PauseIcon fontSize="inherit" /> : <PlayArrowIcon fontSize="inherit" />}
            </IconButton>
            <IconButton onClick={handleNext} sx={{ color: "#fff", fontSize: "2.5rem" }}>
              <SkipNextIcon fontSize="inherit" />
            </IconButton>
            <IconButton onClick={toggleRepeat} sx={{ color: repeatMode !== "off" ? "#1db954" : "rgba(255,255,255,0.7)", fontSize: "2rem" }}>
              {repeatMode === "one" ? <RepeatOneIcon fontSize="large" /> : <RepeatIcon fontSize="large" />}
            </IconButton>
          </Box>
        </Box>
      )}


      <audio ref={audioRef} />
    </>
  );
}
