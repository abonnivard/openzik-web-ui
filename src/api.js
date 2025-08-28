const BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// Requête générique **avec token**
async function requestWithToken(path, options = {}) {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  
  // Vérifier si le token a expiré (401 Unauthorized)
  if (res.status === 401) {
    // Déclencher l'événement d'expiration du token
    window.dispatchEvent(new CustomEvent('token-expired'));
    
    // Fallback: redirection directe si l'événement ne fonctionne pas
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }, 100);
    
    throw new Error("Session expired. Please log in again.");
  }
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "API Error");
  }
  return res.json();
}

// Requête générique **sans token** (login, signup, etc.)
async function requestWithoutToken(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "API Error");
  }
  return res.json();
}

// Login
export function apiLogin(username, password) {
  return requestWithoutToken("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// Change password
export function apiChangePassword(username, newPassword, oldPassword) {
  return requestWithToken("/login/change-password", {
    method: "POST",
    body: JSON.stringify({ username, newPassword, oldPassword }),
  });
}

// Recherche multi-types
export function apiSearch(q) {
  return requestWithToken(`/search?q=${encodeURIComponent(q)}`);
}

// Recherche dans la bibliothèque locale
export function apiSearchLocal(q) {
  return requestWithToken(`/library/search?q=${encodeURIComponent(q)}`);
}


// Download album
export function apiDownload(album) {
  return requestWithToken("/download", {
    method: "POST",
    body: JSON.stringify({ album }),
  });
}

// Get library
export function apiGetLibrary() {
  return requestWithToken("/library");
}

// Get user info
export function apiGetUserInfo() {
  return requestWithToken("/login/user-info");
}

// Update user info
export function apiUpdateUserInfo(data) {
  return requestWithToken("/login/user-info", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Playlists
export const apiGetPlaylists = () => requestWithToken(`/playlists/`);

export const apiCreatePlaylist = (name) =>
  requestWithToken("/playlists", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

// Ajouter un track à une playlist
export const apiAddTrackToPlaylist = (playlistId, trackId) =>
  requestWithToken(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify({ trackId }),
  });

// Supprimer un track d'une playlist
export const apiRemoveTrackFromPlaylist = (playlistId, trackId) =>
  requestWithToken(`/playlists/${playlistId}/tracks/${trackId}`, {
    method: "DELETE",
  });

// Supprimer une playlist entière
export const apiDeletePlaylist = (playlistId) =>
  requestWithToken(`/playlists/${playlistId}`, {
    method: "DELETE",
  });

// Récupérer tous les tracks d'une playlist
export const apiGetPlaylistTracks = (playlistId) =>
  requestWithToken(`/playlists/${playlistId}/tracks`);

// Pin/Unpin une playlist
export const apiPinPlaylist = (playlistId, isPinned) =>
  requestWithToken(`/playlists/${playlistId}/pin`, {
    method: "PUT",
    body: JSON.stringify({ isPinned }),
  });


// Likes
export const apiGetLikedTracks = () => requestWithToken(`/likes`);
export const apiLikeTrack = (trackId) =>
  requestWithToken("/likes", {
    method: "POST",
    body: JSON.stringify({ trackId }),
  });
export const apiUnlikeTrack = (trackId) =>
  requestWithToken("/likes", {
    method: "DELETE",
    body: JSON.stringify({ trackId }),
  });


export const apiAddRecentlyPlayed = (trackId) =>
requestWithToken("/music/track-played", {
  method: "POST",
  body: JSON.stringify({ trackId }),
});

// === ADMIN API ===

// Récupérer tous les utilisateurs (admin seulement)
export const apiGetAllUsers = () => requestWithToken("/admin/users");

// Créer un nouvel utilisateur (admin seulement)
export const apiCreateUser = (userData) =>
  requestWithToken("/admin/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });

// Modifier un utilisateur (admin seulement)
export const apiUpdateUser = (userId, userData) =>
  requestWithToken(`/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });

// Supprimer un utilisateur (admin seulement)
export const apiDeleteUser = (userId) =>
  requestWithToken(`/admin/users/${userId}`, {
    method: "DELETE",
  });

// Récupérer les statistiques générales (admin seulement)
export const apiGetAdminStats = () => requestWithToken("/admin/stats");

// Récupérer le profil de l'utilisateur connecté
export const apiGetUserProfile = () => requestWithToken("/me");

// Récupérer les titres récemment joués
export const apiGetRecentlyPlayed = () =>
  requestWithToken("/home/recently-played");

// Récupérer les top 5 tracks les plus écoutés
export const apiGetTopTracks = () =>
  requestWithToken("/stats/top-tracks");

// Récupérer des artistes aléatoires
export const apiGetRandomArtists = (limit = 5) =>
  requestWithToken(`/stats/random-artists?limit=${limit}`);

// Récupérer les statistiques générales de l'utilisateur
export const apiGetUserStats = () =>
  requestWithToken("/stats/user-stats");

// === Fonctions pour les images ===

// Upload image de profil (base64)
export const apiUploadProfileImage = (imageData) =>
  requestWithToken("/uploads/profile-image", {
    method: "POST",
    body: JSON.stringify({ imageData }),
  });

// Upload image de playlist (base64)
export const apiUploadPlaylistImage = (playlistId, imageData) =>
  requestWithToken(`/uploads/playlist-image/${playlistId}`, {
    method: "POST",
    body: JSON.stringify({ imageData }),
  });

// Supprimer image de profil
export const apiRemoveProfileImage = () =>
  requestWithToken("/uploads/profile-image", {
    method: "DELETE",
  });

// Supprimer image de playlist
export const apiRemovePlaylistImage = (playlistId) =>
  requestWithToken(`/uploads/playlist-image/${playlistId}`, {
    method: "DELETE",
  });