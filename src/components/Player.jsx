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
import { apiLikeTrack, apiUnlikeTrack, apiGetLikedTracks } from "../api";
import { useOfflineMode } from "../hooks/useOfflineMode";
import authStorage from "../services/authStorage";
import { safeSetItem, safeGetItem, safeRemoveItem } from "../utils/storage";

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
  const { shouldUseOfflineMode } = useOfflineMode();

  // Swipe down detection
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Swipe detection functions
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -50; // Swipe down (at least 50px)
    
    if (isDownSwipe) {
      setOpenMobile(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Load queue from sessionStorage
  useEffect(() => {
    const savedQueue = safeGetItem("musicQueue", []);
    setQueue(savedQueue);
  }, []);

  // Save queue to sessionStorage when it changes
  useEffect(() => {
    safeSetItem("musicQueue", queue);
  }, [queue]);

  // Function to add a track to queue
  const addToQueue = useCallback((track) => {
    // Include current playlist as context to return after queue
    const currentPlaylist = safeGetItem("selectedPlaylist");
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
    if (shouldUseOfflineMode) {
      // En mode offline, charger les likes depuis localStorage
      try {
        const localLiked = JSON.parse(localStorage.getItem('likedTracks') || '[]');
        setLikedTracks(localLiked.map(t => t.id));
      } catch (error) {
        console.error("Error loading offline liked tracks:", error);
      }
      return;
    }

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
  }, [shouldUseOfflineMode]);

  // Handle like/unlike
  const handleLike = useCallback(async (trackId) => {
    if (shouldUseOfflineMode) {
      // En mode offline, gérer les likes localement
      try {
        const localLiked = JSON.parse(localStorage.getItem('likedTracks') || '[]');
        const isLiked = localLiked.some(t => t.id === trackId);
        
        if (isLiked) {
          const filtered = localLiked.filter(t => t.id !== trackId);
          localStorage.setItem('likedTracks', JSON.stringify(filtered));
          setLikedTracks(filtered.map(t => t.id));
        } else {
          // Ajouter la track aux likes avec les infos actuelles
          const newLiked = [...localLiked, currentTrack];
          localStorage.setItem('likedTracks', JSON.stringify(newLiked));
          setLikedTracks(newLiked.map(t => t.id));
        }
      } catch (error) {
        console.error("Error toggling offline like:", error);
      }
      return;
    }

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
  }, [likedTracks, shouldUseOfflineMode, currentTrack]);

  // Charger la library depuis la playlist en cours si existante
  useEffect(() => {
    const selectedPlaylist = safeGetItem("selectedPlaylist");
    if (selectedPlaylist?.tracks) {
      setLibrary(selectedPlaylist.tracks);
    } else {
      const lib = safeGetItem("library", []);
      setLibrary(lib);
    }
  }, []);

  // Mettre à jour la library si la playlist change
  useEffect(() => {
    const updateLibrary = () => {
      const selectedPlaylist = safeGetItem("selectedPlaylist");
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
      const track = safeGetItem("currentTrack");
      setCurrentTrack(track);
      const playing = safeGetItem("isPlaying", false);
      setIsPlaying(playing);
    };
    updateTrack();
    window.addEventListener("storage", updateTrack);
    return () => window.removeEventListener("storage", updateTrack);
  }, []);

  // State to track if user has interacted (required for iOS autoplay)
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isAttemptingPlay, setIsAttemptingPlay] = useState(false);
  const playTimeoutRef = useRef(null);

  // Function to attempt play with iOS-specific handling and concurrency protection
  const attemptPlay = useCallback(async (audio) => {
    if (!audio || isAttemptingPlay) return false;
    
    // Clear any pending play attempts
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
      playTimeoutRef.current = null;
    }
    
    // Prevent concurrent play attempts
    setIsAttemptingPlay(true);
    
    try {
      // Check if audio source is valid before attempting play
      if (!audio.src || audio.src === '') {
        console.warn("No audio source available");
        setIsAttemptingPlay(false);
        return false;
      }

      // Wait for any ongoing operations to complete
      if (audio.readyState < 2) {
        console.log("Audio not ready, waiting...");
        setIsAttemptingPlay(false);
        return false;
      }

      await audio.play();
      setIsAttemptingPlay(false);
      return true;
    } catch (error) {
      setIsAttemptingPlay(false);
      const errorMessage = error.message || error.toString();
      
      // Handle specific iOS/Capacitor errors
      if (errorMessage.includes('operation is not supported') || 
          errorMessage.includes('NotSupportedError')) {
        console.log("iOS/Capacitor audio not supported - skipping autoplay");
        return false;
      }
      
      // Handle "operation was aborted" - common in iOS when multiple play attempts
      if (errorMessage.includes('operation was aborted') || 
          errorMessage.includes('AbortError')) {
        console.log("iOS autoplay blocked - user interaction required");
        setUserHasInteracted(false);
        return false;
      }
      
      // On iOS, if autoplay is blocked, we need user interaction
      if (error.name === 'NotAllowedError') {
        console.log("iOS autoplay blocked - user interaction required");
        setUserHasInteracted(false);
        return false;
      }
      
      return false;
    }
  }, [isAttemptingPlay]);

  // Safe delayed play function
  const delayedPlay = useCallback((audio, delay = 100) => {
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    
    playTimeoutRef.current = setTimeout(() => {
      if (!isAttemptingPlay) {
        attemptPlay(audio);
      }
    }, delay);
  }, [attemptPlay, isAttemptingPlay]);

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
      safeSetItem("playlistToRestore", nextTrack.fromPlaylist);
    }
    
    setQueue(prev => prev.slice(1)); // Remove first track from queue
    setCurrentTrack(nextTrack);
    sessionStorage.setItem("currentTrack", JSON.stringify(nextTrack));
    setProgress(0);
    
    // Ensure playback continues on iOS
    if (isPlaying && userHasInteracted) {
      setTimeout(async () => {
        const audio = audioRef.current;
        if (audio && audio.src) {
          audio.load(); // Force reload on iOS
          // Wait a bit more for iOS to process the new source
          delayedPlay(audio, 150);
        }
      }, 100);
    }
    return;
  }

  // Check if we need to restore a playlist after queue is empty
  const playlistToRestore = safeGetItem("playlistToRestore");
  if (playlistToRestore) {
    console.log("Restoring playlist after queue:", playlistToRestore.name);
    safeSetItem("selectedPlaylist", playlistToRestore);
    safeRemoveItem("playlistToRestore");
    setLibrary(playlistToRestore.tracks || []);
    window.dispatchEvent(new Event("storage"));
    
    // Continue with first track of restored playlist
    if (playlistToRestore.tracks && playlistToRestore.tracks.length > 0) {
      const firstTrack = playlistToRestore.tracks[0];
      setCurrentTrack(firstTrack);
      sessionStorage.setItem("currentTrack", JSON.stringify(firstTrack));
      setProgress(0);
      
      // Ensure playback continues on iOS
      if (isPlaying && userHasInteracted) {
        setTimeout(async () => {
          const audio = audioRef.current;
          if (audio && audio.src) {
            audio.load(); // Force reload on iOS
            // Wait a bit more for iOS to process the new source
            delayedPlay(audio, 150);
          }
        }, 100);
      }
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
    
    // Ensure playback continues on iOS
    if (isPlaying && userHasInteracted) {
      setTimeout(async () => {
        const audio = audioRef.current;
        if (audio && audio.src) {
          audio.load(); // Force reload on iOS
          // Wait a bit more for iOS to process the new source
          delayedPlay(audio, 150);
        }
      }, 100);
    }
  } else {
    setIsPlaying(false);
  }
}, [currentTrack, library, queue, isShuffle, repeatMode, isPlaying, userHasInteracted, attemptPlay, delayedPlay]);

const handlePrev = useCallback(() => {
  if (!currentTrack || library.length === 0) return;

  const idx = library.findIndex((t) => t.file_path === currentTrack.file_path);
  if (idx > 0) {
    const prevTrack = library[idx - 1];
    setCurrentTrack(prevTrack);
    sessionStorage.setItem("currentTrack", JSON.stringify(prevTrack));
    setProgress(0);
    
    // Ensure playback continues on iOS
    if (isPlaying && userHasInteracted) {
      setTimeout(async () => {
        const audio = audioRef.current;
        if (audio && audio.src) {
          audio.load(); // Force reload on iOS
          // Wait a bit more for iOS to process the new source
          delayedPlay(audio, 150);
        }
      }, 100);
    }
  } else if (audioRef.current) {
    try {
      audioRef.current.currentTime = 0;
    } catch (error) {
      console.log("Reset time operation failed (iOS development mode):", error.message);
    }
  }
}, [currentTrack, library, isPlaying, userHasInteracted, attemptPlay, delayedPlay]);


  const togglePlay = () => {
    setUserHasInteracted(true); // Mark user interaction for iOS
    setIsPlaying((prev) => !prev);
  };

  // Wrapper functions to ensure user interaction is marked
  const handleNextWithInteraction = () => {
    setUserHasInteracted(true);
    handleNext();
  };

  const handlePrevWithInteraction = () => {
    setUserHasInteracted(true);
    handlePrev();
  };
  const toggleShuffle = () => setIsShuffle((prev) => !prev);
  const toggleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  const handleSeek = (_, value) => {
    if (audioRef.current && !isNaN(value)) {
      try {
        audioRef.current.currentTime = value;
        setProgress(value);
      } catch (error) {
        console.log("Seek operation failed (iOS development mode):", error.message);
      }
    }
  };

  useEffect(() => {
    const selectedPlaylist = safeGetItem("selectedPlaylist");
    if (!selectedPlaylist) {
      const lib = safeGetItem("library", []);
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
      
      // Preload audio for iOS
      audio.preload = "auto";
      audio.load();
    }

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      // On iOS, sometimes we need to trigger play after metadata is loaded
      if (isPlaying && audio.paused && userHasInteracted) {
        // Small delay to ensure metadata is fully loaded
        delayedPlay(audio, 50);
      }
    };
    
    const onTimeUpdate = () => setProgress(audio.currentTime);
    
    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        if (userHasInteracted) {
          delayedPlay(audio, 50);
        }
      } else {
        handleNext();
      }
    };

    const onCanPlayThrough = () => {
      // iOS sometimes needs this event to properly start playback
      if (isPlaying && audio.paused && userHasInteracted) {
        delayedPlay(audio, 50);
      }
    };

    const onError = (e) => {
      console.warn("Audio error:", e.target.error);
      // Don't try to play if there's an audio error
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplaythrough", onCanPlayThrough);
    audio.addEventListener("error", onError);

    if (isPlaying && userHasInteracted) {
      // Wait a bit longer before trying to play to ensure audio is ready
      delayedPlay(audio, 100);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplaythrough", onCanPlayThrough);
      audio.removeEventListener("error", onError);
    };
  }, [currentTrack, isPlaying, repeatMode, handleNext, userHasInteracted, attemptPlay, delayedPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      if (userHasInteracted) {
        // Add a small delay to ensure audio element is ready
        delayedPlay(audio, 100);
      } else {
        console.log("User interaction required for audio playback on iOS");
      }
    } else {
      // Safely pause without throwing errors
      try {
        audio.pause();
      } catch (error) {
        // Ignore pause errors in iOS development mode
        console.log("Pause operation ignored:", error.message);
      }
    }
  }, [isPlaying, userHasInteracted, attemptPlay, delayedPlay]);

  // Add global event listeners to detect user interaction for iOS
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserHasInteracted(true);
      // Remove listeners once user has interacted
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };

    if (!userHasInteracted) {
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
      document.addEventListener('click', handleUserInteraction, { once: true });
    }

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, [userHasInteracted]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, []);

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
            <IconButton onClick={handlePrevWithInteraction} sx={{ color: "#fff" }}>
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
            <IconButton onClick={handleNextWithInteraction} sx={{ color: "#fff" }}>
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
        
        <audio 
          ref={audioRef} 
          preload="auto"
          playsInline
          crossOrigin="anonymous"
        />
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
          display: "flex",
          flexDirection: "column",
          px: 2,
          py: 0.5, // Réduit de 1.5 à 0.5
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", cursor: "pointer" }}
             onClick={() => setOpenMobile(true)}
        >
          <Avatar src={currentTrack.image || ""} alt={currentTrack.title} variant="rounded" sx={{ width: 35, height: 35 }} />
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <Typography noWrap sx={{ color: "#fff", fontWeight: 600, fontSize: "0.75rem" }}>{currentTrack.title}</Typography>
            <Typography noWrap sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.6rem" }}>{currentTrack.artist}</Typography>
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
                padding: "3px",
                minWidth: "26px",
                minHeight: "26px"
              }}
              size="small"
            >
              {currentTrack && likedTracks.includes(currentTrack.id) ? <FavoriteIcon sx={{ fontSize: "1rem" }} /> : <FavoriteBorderIcon sx={{ fontSize: "1rem" }} />}
            </IconButton>
            
            
            <IconButton 
              onClick={(e) => { 
                e.stopPropagation(); 
                togglePlay(); 
              }} 
              sx={{ 
                color: "#000", 
                bgcolor: "#1db954",
                width: 28,
                height: 28,
                ml: 0.5,
                "&:hover": { bgcolor: "#1ed760" }
              }}
            >
              {isPlaying ? <PauseIcon sx={{ fontSize: "0.9rem" }} /> : <PlayArrowIcon sx={{ fontSize: "0.9rem" }} />}
            </IconButton>
          </Box>
        </Box>
        
        {/* Slider plus visible */}
        <Box sx={{ width: "100%", mt: 0.5, mb: 0.5 }}>
          <Slider value={progress} max={duration} onChange={handleSeek} sx={{
            color: "#1db954",
            height: 4, // Plus visible
            "& .MuiSlider-thumb": { 
              width: 12, 
              height: 12,
              "&:hover": { boxShadow: "0 0 0 8px rgba(29, 185, 84, 0.16)" }
            },
            "& .MuiSlider-rail": { 
              height: 4, 
              opacity: 0.3, 
              bgcolor: "rgba(255,255,255,0.3)" 
            },
            "& .MuiSlider-track": { height: 4 },
          }} />
        </Box>
      </Box>

      {/* === Expanded Mobile Player === */}
      {openMobile && (
        <Box 
          sx={{
            position: "fixed",
            left: 0,
            top: "calc(env(safe-area-inset-top) + 56px)", // Safe area + navbar top
            right: 0,
            bottom: "calc(env(safe-area-inset-bottom) + 56px)", // Safe area + navbar bottom
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
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header avec Close à gauche et Like à droite */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            width: "100%", 
            px: 2, 
            pt: 1 
          }}>
            <IconButton 
              onClick={() => setOpenMobile(false)} 
              sx={{ 
                color: "#fff", 
                padding: "6px",
                minWidth: "32px",
                minHeight: "32px"
              }}
            >
              <CloseIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
            <Box /> {/* Spacer pour centrer */}
            <IconButton 
              onClick={() => currentTrack && handleLike(currentTrack.id)} 
              sx={{ 
                color: currentTrack && likedTracks.includes(currentTrack.id) ? "#1db954" : "rgba(255,255,255,0.7)",
                padding: "6px",
                minWidth: "32px",
                minHeight: "32px"
              }}
            >
              {currentTrack && likedTracks.includes(currentTrack.id) ? <FavoriteIcon sx={{ fontSize: "1.2rem" }} /> : <FavoriteBorderIcon sx={{ fontSize: "1.2rem" }} />}
            </IconButton>
          </Box>
          
          {/* Container principal responsive - plus compact */}
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            flex: 1, 
            justifyContent: "flex-start", // Changed from space-between to flex-start
            gap: { xs: 0.5, sm: 1 }, // Réduit de 1-2 à 0.5-1
            px: 2,
            py: 0.5, // Réduit de 1
            maxHeight: "100%",
            overflow: "hidden",
            mt: 4,
          }}>
            {/* Image de l'album - responsive */}
            <Avatar 
              src={currentTrack.image || ""} 
              alt={currentTrack.title} 
              variant="rounded" 
              sx={{ 
                width: { xs: "70vw", sm: "60vw", md: 280 }, 
                height: { xs: "70vw", sm: "60vw", md: 280 }, 
                maxWidth: 320,
                maxHeight: 320,
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                flexShrink: 0
              }} 
            />
            
            {/* Infos du track - plus compact */}
            <Box sx={{ textAlign: "center", width: "100%", px: 1, flexShrink: 0, mt: 4 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.2, // Réduit de 0.5 à 0.2
                  fontSize: { xs: "1.1rem", sm: "1.3rem" },
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {currentTrack.title}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: "rgba(255,255,255,0.7)", 
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {currentTrack.artist}
              </Typography>
            </Box>
            
            {/* Slider et temps - plus compact */}
            <Box sx={{ width: "100%", px: 1, flexShrink: 0}}>
              <Slider 
                value={progress} 
                max={duration} 
                onChange={handleSeek} 
                sx={{ 
                  color: "#1db954", 
                  width: "100%", 
                  mb: 1,
                  height: { xs: 4, sm: 6 },
                  "& .MuiSlider-thumb": { 
                    width: { xs: 16, sm: 20 }, 
                    height: { xs: 16, sm: 20 } 
                  },
                  "& .MuiSlider-track": { height: { xs: 4, sm: 6 } },
                  "& .MuiSlider-rail": { height: { xs: 4, sm: 6 }, opacity: 0.3 }
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

          {/* Boutons de contrôle - plus compacts */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: { xs: 2, sm: 3 }, 
            width: "100%",
            flexShrink: 0,
            pt: 1, // Padding top au lieu de pb
            mb: "10%" // Margin bottom pour espacer du bas
          }}>
            {/* Shuffle */}
            <IconButton 
              onClick={toggleShuffle} 
              sx={{ 
                color: isShuffle ? "#1db954" : "rgba(255,255,255,0.7)", 
                padding: "6px",
                minWidth: "32px",
                minHeight: "32px"
              }}
            >
              <ShuffleIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>

            {/* Previous */}
            <IconButton 
              onClick={handlePrevWithInteraction} 
              sx={{ 
                color: "#fff", 
                padding: "6px",
                minWidth: "36px",
                minHeight: "36px"
              }}
            >
              <SkipPreviousIcon sx={{ fontSize: "1.5rem" }} />
            </IconButton>

            {/* Play/Pause - bouton principal */}
            <IconButton 
              onClick={togglePlay} 
              sx={{ 
                color: "#000", 
                bgcolor: "#1db954",
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                "&:hover": { bgcolor: "#1ed760" }
              }}
            >
              {isPlaying ? <PauseIcon sx={{ fontSize: "1.8rem" }} /> : <PlayArrowIcon sx={{ fontSize: "1.8rem" }} />}
            </IconButton>

            {/* Next */}
            <IconButton 
              onClick={handleNextWithInteraction} 
              sx={{ 
                color: "#fff", 
                padding: "6px",
                minWidth: "36px",
                minHeight: "36px"
              }}
            >
              <SkipNextIcon sx={{ fontSize: "1.5rem" }} />
            </IconButton>

            {/* Repeat */}
            <IconButton 
              onClick={toggleRepeat} 
              sx={{ 
                color: repeatMode !== "off" ? "#1db954" : "rgba(255,255,255,0.7)", 
                padding: "6px",
                minWidth: "32px",
                minHeight: "32px"
              }}
            >
              {repeatMode === "one" ? <RepeatOneIcon sx={{ fontSize: "1.1rem" }} /> : <RepeatIcon sx={{ fontSize: "1.1rem" }} />}
            </IconButton>
          </Box>
        </Box>
      )}


      <audio 
        ref={audioRef} 
        preload="auto"
        playsInline
        crossOrigin="anonymous"
      />
    </>
  );
}
