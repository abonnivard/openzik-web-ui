// Utility functions for optimized sessionStorage management

// Maximum size for sessionStorage data (in characters)
const MAX_STORAGE_SIZE = 500000; // ~500KB

// Estimate size of JSON string
function getStorageSize(obj) {
  return JSON.stringify(obj).length;
}

// Clean up old storage data to make room
function cleanupStorage() {
  try {
    // Remove old queue data if too large
    const queue = sessionStorage.getItem("musicQueue");
    if (queue && queue.length > 100000) {
      sessionStorage.removeItem("musicQueue");
    }
    
    // Remove other potential large items
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('temp_') || key.includes('cache_')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error cleaning storage:", error);
  }
}

// Optimized playlist data for storage (keep only essential fields)
function optimizePlaylistForStorage(playlist) {
  if (!playlist) return null;
  
  return {
    id: playlist.id,
    name: playlist.name,
    image: playlist.image,
    isLikedPlaylist: playlist.isLikedPlaylist,
    custom_image: playlist.custom_image,
    tracks: playlist.tracks ? playlist.tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      image: track.image,
      file_path: track.file_path,
      url: track.url
    })) : []
  };
}

// Safe setItem with size check and cleanup
export function safeSetItem(key, value) {
  try {
    const stringValue = JSON.stringify(value);
    
    // Check if the data is too large
    if (stringValue.length > MAX_STORAGE_SIZE) {
      console.warn(`Data for key "${key}" is too large, optimizing...`);
      
      // If it's a playlist, optimize it
      if (value && value.tracks) {
        const optimized = optimizePlaylistForStorage(value);
        sessionStorage.setItem(key, JSON.stringify(optimized));
        return;
      }
    }
    
    sessionStorage.setItem(key, stringValue);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('SessionStorage quota exceeded, cleaning up...');
      cleanupStorage();
      
      try {
        // Try again after cleanup with optimized data
        const optimized = value && value.tracks ? optimizePlaylistForStorage(value) : value;
        sessionStorage.setItem(key, JSON.stringify(optimized));
      } catch (retryError) {
        console.error('Failed to store data even after cleanup:', retryError);
        // As last resort, store minimal data
        if (value && value.tracks) {
          const minimal = {
            id: value.id,
            name: value.name,
            tracks: value.tracks.slice(0, 50) // Limit to first 50 tracks
          };
          sessionStorage.setItem(key, JSON.stringify(minimal));
        }
      }
    } else {
      console.error('Error storing data:', error);
    }
  }
}

// Safe getItem
export function safeGetItem(key, defaultValue = null) {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving data for key "${key}":`, error);
    return defaultValue;
  }
}

// Safe removeItem
export function safeRemoveItem(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key "${key}":`, error);
  }
}
