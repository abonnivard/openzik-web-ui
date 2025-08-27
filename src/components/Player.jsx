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

export default function Player() {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [library, setLibrary] = useState([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // off | all | one
  const [openMobile, setOpenMobile] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
  if (!currentTrack || library.length === 0) return;

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
}, [currentTrack, library, isShuffle, repeatMode]);

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
          p: 1.5,
          px: 3,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Avatar
          src={currentTrack.image || ""}
          alt={currentTrack.title}
          variant="rounded"
          sx={{ width: 56, height: 56, mr: 2 }}
        />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", mr: 2 }}>
          <Typography noWrap sx={{ fontWeight: 600 }}>
            {currentTrack.title}
          </Typography>
          <Typography noWrap sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
            {currentTrack.artist}
          </Typography>
          <Slider
            value={progress}
            max={duration}
            onChange={handleSeek}
            sx={{
              color: "#1db954",
              height: 4,
              mt: 0.5,
              "& .MuiSlider-thumb": { width: 12, height: 12 },
            }}
          />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.3 }}>
            {Math.floor(progress / 60)}:{("0" + Math.floor(progress % 60)).slice(-2)} /{" "}
            {Math.floor(duration / 60)}:{("0" + Math.floor(duration % 60)).slice(-2)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={toggleShuffle} sx={{ color: isShuffle ? "#1db954" : "#fff" }}>
            <ShuffleIcon />
          </IconButton>
          <IconButton onClick={handlePrev} sx={{ color: "#fff" }}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton onClick={togglePlay} sx={{ color: "#1db954" }}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton onClick={handleNext} sx={{ color: "#fff" }}>
            <SkipNextIcon />
          </IconButton>
          <IconButton onClick={toggleRepeat} sx={{ color: repeatMode !== "off" ? "#1db954" : "#fff" }}>
            {repeatMode === "one" ? <RepeatOneIcon /> : <RepeatIcon />}
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
          py: 1,
          mb: 5,
          backdropFilter: "blur(10px)",
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", cursor: "pointer" }}
             onClick={() => setOpenMobile(true)}
        >
          <Avatar src={currentTrack.image || ""} alt={currentTrack.title} variant="rounded" sx={{ width: 50, height: 50 }} />
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Typography noWrap sx={{ color: "#fff", fontWeight: 600 }}>{currentTrack.title}</Typography>
            <Typography noWrap sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{currentTrack.artist}</Typography>
          </Box>
          <IconButton onClick={(e) => { e.stopPropagation(); togglePlay(); }} sx={{ color: "#1db954" }}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
        </Box>
        <Box sx={{ width: "100%", mt: 1 }}>
          <Slider value={progress} max={duration} onChange={handleSeek} sx={{
            color: "#1db954",
            height: 3,
            "& .MuiSlider-thumb": { width: 12, height: 12 },
            "& .MuiSlider-rail": { height: 3, opacity: 0.3, bgcolor: "#fff" },
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
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, fontSize: "1.6rem" }}>
                {currentTrack.title}
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "1.2rem" }}>
                {currentTrack.artist}
              </Typography>
            </Box>
            
            <Box sx={{ width: "100%", px: 2 }}>
              <Slider 
                value={progress} 
                max={duration} 
                onChange={handleSeek} 
                sx={{ 
                  color: "#1db954", 
                  width: "100%", 
                  mb: 2,
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

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, mb: 10 }}>
            <IconButton onClick={toggleShuffle} sx={{ color: isShuffle ? "#1db954" : "#fff", fontSize: "2rem" }}>
              <ShuffleIcon fontSize="large" />
            </IconButton>
            <IconButton onClick={handlePrev} sx={{ color: "#fff", fontSize: "2.5rem" }}>
              <SkipPreviousIcon fontSize="inherit" />
            </IconButton>
            <IconButton 
              onClick={togglePlay} 
              sx={{ 
                color: "#fff", 
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
            <IconButton onClick={toggleRepeat} sx={{ color: repeatMode !== "off" ? "#1db954" : "#fff", fontSize: "2rem" }}>
              {repeatMode === "one" ? <RepeatOneIcon fontSize="large" /> : <RepeatIcon fontSize="large" />}
            </IconButton>
          </Box>
        </Box>
      )}

      <audio ref={audioRef} />
    </>
  );
}
