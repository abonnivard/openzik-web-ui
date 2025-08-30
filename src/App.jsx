import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { Box, CssBaseline, Snackbar, Alert, Slide, useTheme, useMediaQuery } from "@mui/material";
import { AccountCircle, AdminPanelSettings } from "@mui/icons-material";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Account from "./pages/Account";
import Administration from "./pages/Administration";
import Login from "./pages/Login";
import OfflineLibrary from "./pages/OfflineLibrary";
import DownloadedMusic from "./pages/DownloadedMusic";
import ServerSetup from "./pages/ServerSetup";
import PrivateRoute from "./components/PrivateRoute";
import SafeAreaBox from "./components/SafeAreaBox";
import AdminRoute from "./components/AdminRoute";
import Playlists from "./pages/UserPlaylists";
import { useTokenExpiration } from "./hooks/useTokenExpiration";
import { useOfflineMode } from "./hooks/useOfflineMode";
import { apiGetUserProfile } from "./api";
import { hasOfflineSupport } from "./utils/platform";
import configService from "./services/configService";
import authStorage from "./services/authStorage";
import logo from "./assets/OpenZik-logo.png";

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [toast, setToast] = useState({ message: "", severity: "info" });
  const [isServerConfigured, setIsServerConfigured] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Utiliser les hooks
  useTokenExpiration();
  const { shouldUseOfflineMode, enableOfflineMode } = useOfflineMode();

  // Écouter les changements de mode offline
  useEffect(() => {
    const handleOfflineModeChange = (event) => {
      if (event.detail && hasOfflineSupport()) {
        // Mode offline activé - ne plus chercher le profil utilisateur
        setUserProfile(null);
        authStorage.clearAuth();
      }
    };

    window.addEventListener('offline-mode-changed', handleOfflineModeChange);
    return () => window.removeEventListener('offline-mode-changed', handleOfflineModeChange);
  }, []);

  // Migration depuis sessionStorage (une seule fois)
  useEffect(() => {
    authStorage.migrateFromSessionStorage();
  }, []);

  // Vérifier la configuration du serveur au démarrage
  useEffect(() => {
    const checkServerConfig = () => {
      // Seulement vérifier la configuration sur iOS et si pas en mode offline forcé
      if (hasOfflineSupport() && !shouldUseOfflineMode) {
        const configured = configService.isConfigured();
        setIsServerConfigured(configured);
      } else {
        // Sur web ou en mode offline, toujours considéré comme configuré
        setIsServerConfigured(true);
      }
      setCheckingConfig(false);
    };

    checkServerConfig();
  }, [shouldUseOfflineMode]);

  

  const handleLogin = () => {
    window.location.href = "/";
  };

  const handleServerConfigComplete = () => {
    setIsServerConfigured(true);
  };

  // Afficher l'écran de configuration si le serveur n'est pas configuré (iOS uniquement et pas en mode offline)
  if (checkingConfig) {
    return <Box sx={{ bgcolor: '#121212', minHeight: '100vh' }} />; // Loading screen
  }

  if (!isServerConfigured && hasOfflineSupport() && !shouldUseOfflineMode) {
    return (
      <>
        <CssBaseline />
        <ServerSetup onComplete={handleServerConfigComplete} />
      </>
    );
  }

  const drawerWidth = 0;
  const mobileNavHeight = 56;
  const mobilePlayerHeight = 80; // Augmenté pour inclure le slider

  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Login isolé */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Toutes les autres pages */}
        <Route
          path="/*"
          element={
            <SafeAreaBox
              sx={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                bgcolor: "#121212",
                color: "#fff",
                fontFamily: "Inter, sans-serif",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <Sidebar />

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  ml: !isMobile ? `${drawerWidth}px` : 0,
                }}
              >

                {/* Main content */}
                <Box
                  component="main"
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: { xs: 2, sm: 3 },
                    mt: isMobile ? `${mobileNavHeight}px` : 0,
                    mb: isMobile ? `${mobilePlayerHeight + 16}px` : 0,
                    background: "linear-gradient(180deg, rgba(40,40,40,0.95) 0%, rgba(18,18,18,1) 100%)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Routes>
                    <Route path="/" element={<PrivateRoute><Home setToast={setToast} /></PrivateRoute>} />
                    <Route path="/search" element={<PrivateRoute><Search setToast={setToast} /></PrivateRoute>} />
                    <Route path="/library" element={<PrivateRoute><Library setToast={setToast} /></PrivateRoute>} />
                    <Route path="/offline" element={<PrivateRoute><OfflineLibrary setToast={setToast} /></PrivateRoute>} />
                    <Route path="/downloads" element={<PrivateRoute><DownloadedMusic setToast={setToast} /></PrivateRoute>} />
                    <Route path="/playlists" element={<PrivateRoute><Playlists setToast={setToast} /></PrivateRoute>} />
                    <Route path="/account" element={<PrivateRoute><Account setToast={setToast} /></PrivateRoute>} />
                    <Route path="/administration" element={
                      <PrivateRoute>
                        <AdminRoute>
                          <Administration setToast={setToast} />
                        </AdminRoute>
                      </PrivateRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Box>

                {/* Player desktop */}
                {!isMobile && <Player />}

                {/* Player mobile */}
                {isMobile && (
                  <Box
                    sx={{
                      position: "fixed",
                      bottom: hasOfflineSupport() ? "env(safe-area-inset-bottom)" : 0,
                      left: 0,
                      right: 0,
                      bottom: 80,
                      zIndex: 1100,
                      pb: hasOfflineSupport() ? 0 : 1, // Padding bottom seulement si pas de safe area
                    }}
                  >
                    <Player compact />
                  </Box>
                )}
              </Box>
            </SafeAreaBox>
          }
        />
      </Routes>

      {/* Toast */}
      <Snackbar
        open={!!toast.message}
        autoHideDuration={4000}
        onClose={() => setToast({ message: "", severity: "info" })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={SlideTransition}
        sx={{
          mt: isMobile ? (hasOfflineSupport() ? "calc(env(safe-area-inset-top) + 56px + 16px)" : "72px") : "16px"
        }}
      >
        <Alert
          onClose={() => setToast({ message: "", severity: "info" })}
          severity={toast.severity}
          sx={{ width: 350, fontSize: "0.875rem" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
