import React, { useState } from "react";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { Box, CssBaseline, Snackbar, Alert, Slide, useTheme, useMediaQuery } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Account from "./pages/Account";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Playlists from "./pages/UserPlaylists";
import logo from "./assets/OpenZik-logo.png";

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export default function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [toast, setToast] = useState({ message: "", severity: "info" });

  const handleLogin = () => {
    window.location.href = "/";
  };

  const drawerWidth = 0;
  const mobileNavHeight = 56;
  const mobilePlayerHeight = 50;

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
            <Box
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
                {/* Top bar mobile avec logo à gauche et account à droite */}
                {isMobile && (
                  <Box
                    sx={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: mobileNavHeight,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      bgcolor: "rgba(20,20,20,0.95)",
                      backdropFilter: "blur(10px)",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      zIndex: 1200,
                    }}
                  >
                    <NavLink to="/">
                      <Box component="img" src={logo} alt="OpenZik logo" sx={{ height: 40, mt: 1 }} />
                    </NavLink>
                    <NavLink to="/account">
                      <AccountCircle sx={{ fontSize: 30, color: "#fff", mt: 1 }} />
                    </NavLink>
                  </Box>
                )}

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
                    <Route path="/playlists" element={<PrivateRoute><Playlists setToast={setToast} /></PrivateRoute>} />
                    <Route path="/account" element={<PrivateRoute><Account setToast={setToast} /></PrivateRoute>} />
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
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 1100,
                    }}
                  >
                    <Player compact />
                  </Box>
                )}
              </Box>
            </Box>
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
