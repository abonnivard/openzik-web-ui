# 🎵 OpenZik Frontend

## 🚀 Description
OpenZik is a modern open-source web music streaming application inspired by Spotify and designed to run with qBittorrent and Prowlarr.  
- **Material UI (MUI)** for UI design

# Music Web Frontend

This is the frontend for the OpenZik music application. It provides a modern, Spotify-like interface for searching, downloading, and managing your music library.

## Main Features
- Search for artists, tracks, albums, playlists, and Spotify profiles
- Download tracks, albums, and playlists from the backend
- Manage and play your personal music library
- Responsive design (desktop & mobile)
- User authentication and account management

## Project Structure
```
```
├── public/                # Static files (index.html, icons, manifest)
├── src/
│   ├── assets/            # Images and logos
│   ├── components/        # UI components (Sidebar, Player, SearchBar, etc.)
│   ├── pages/             # Main pages (Home, Search, Library, Account, Login)
│   ├── utils/             # Utility functions
│   ├── api.js             # API calls to backend
│   ├── App.jsx            # Main app component
│   ├── index.js           # Entry point
│   └── ...
├── package.json           # Project dependencies
├── .env                   # Environment variables
```

## Installation
1. Install Node.js and npm
2. Clone the repository
3. Install dependencies:
  ```bash
  npm install
  ```
4. Configure the `.env` file if needed
5. Start the development server:
  ```bash
  npm start
  ```

## Usage
- The frontend communicates with the backend via REST API (see backend README)
- All music management, search, and download features are available from the UI
- User authentication is required for most features

## Contribution
- Fork, create a branch, submit a pull request
- Follow the project structure and conventions

## License
MIT
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
