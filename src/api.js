const BASE = "http://localhost:3000";

// Requête générique **avec token**
async function requestWithToken(path, options = {}) {
  const token = sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
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

// Récupérer les titres récemment joués
export const apiGetRecentlyPlayed = () =>
  requestWithToken("/home/recently-played");