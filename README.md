# 🎵 OpenZik Frontend

## 🚀 Description
OpenZik is a modern web music streaming application inspired by Spotify.  
It allows users to:
- Search for artists, albums, tracks, playlists, and profiles from Spotify and download it locally with qBittorrent and Prowlarr.
- Manage their personal library.
- Create and view playlists.
- Play local and streaming music.
- Access their **Recently Played** history.

This repository contains the **frontend** part of the application, built with **React + Material UI**.

---

## 🛠️ Tech Stack
- **React 18**
- **Material UI (MUI)** for UI design
- **React Router** for navigation
- **Axios / fetch** for API calls
- **SessionStorage** to persist the global player state
- **Vite / Create React App** for bundling

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/<your-repo>/openzik-frontend.git
cd openzik-frontend
````

Install dependencies:

```bash
npm install
```

Configure the backend API URL in `src/api.js` (default: `http://localhost:3000`).

---

## ▶️ Development

```bash
npm run dev
```

By default, the app runs on `http://localhost:5173` (Vite).

---

## 🗂️ Project Structure

```
src/
 ├── api/               # Functions for communicating with the backend (REST API)
 ├── assets/            # Images and icons
 ├── components/        # Reusable components (UI, Player, etc.)
 ├── pages/             # Main pages (Home, Library, Login…)
 ├── App.jsx            # Main application entry
 └── main.jsx           # React bootstrap
```

---

## 🔑 Authentication

Authentication is handled using **JWT**, stored on the frontend.

* The token is attached in headers (`Authorization: Bearer <token>`).
* Some routes (e.g., `/home/recently-played`, `/home/playlists`) require a logged-in user.

---

## 📚 Main Pages

* **Home**:

  * Recently played tracks
  * User playlists
* **Library**:

  * Downloaded or local music
* **Player**:

  * Playback controls (Play / Pause / Next / Previous)
* **Login / Register**:

  * Backend authentication (JWT)

---

## 🧪 Useful Scripts

* `npm run dev` → Start the project in development mode
* `npm run build` → Build the project for production
* `npm run preview` → Preview the production build locally
