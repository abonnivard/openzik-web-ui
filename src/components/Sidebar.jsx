import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Button,
} from "@mui/material";
import { Home, Search, LibraryMusic, MenuBook, AccountCircle, AdminPanelSettings, CloudDownload, Logout } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { apiGetUserProfile } from "../api";
import { hasOfflineSupport } from "../utils/platform";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useOfflineMode } from "../hooks/useOfflineMode";
import logo from "./../assets/OpenZik-logo.png";

export default function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [userProfile, setUserProfile] = useState(null);
  const isOnline = useNetworkStatus();
  const { shouldUseOfflineMode, enableOfflineMode, canGoOffline } = useOfflineMode();

  // Navigation items dynamiques selon la connexion
  const getNavItems = () => {
    const baseItems = [
      { label: "Home", path: "/", icon: <Home /> },
      { label: "Library", path: "/library", icon: <MenuBook /> },
      { label: "Playlists", path: "/playlists", icon: <LibraryMusic /> },
    ];

    if (hasOfflineSupport()) {
      // Sur iOS, montrer Search si online et pas en mode offline forcé, Offline si offline ou mode offline forcé
      if (isOnline && !shouldUseOfflineMode) {
        return [
          baseItems[0], // Home
          { label: "Search", path: "/search", icon: <Search /> },
          ...baseItems.slice(1) // Library et Playlists
        ];
      } else {
        return [
          ...baseItems,
          { label: "Offline", path: "/offline", icon: <CloudDownload /> }
        ];
      }
    } else {
      // Sur web, toujours montrer Search
      return [
        baseItems[0], // Home
        { label: "Search", path: "/search", icon: <Search /> },
        ...baseItems.slice(1) // Library et Playlists
      ];
    }
  };

  const navItems = getNavItems();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await apiGetUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  if (isMobile) {
  return (
    <>

      {/* Top navbar mobile avec logo à gauche et icônes à droite */}
      <Box
        sx={{
          position: "fixed",
          top: hasOfflineSupport() ? "env(safe-area-inset-top)" : 0,
          left: 0,
          right: 0,
          height: 56,
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
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Downloads button - uniquement si online et pas en mode offline */}
          {hasOfflineSupport() && isOnline && !shouldUseOfflineMode && (
            <NavLink to="/downloads">
              <CloudDownload sx={{ fontSize: 24, color: "#fff" }} />
            </NavLink>
          )}

          {/* Bouton Se déconnecter sur mobile iOS */}
          {canGoOffline && isOnline && !shouldUseOfflineMode && (
            <Button
              onClick={enableOfflineMode}
              sx={{
                color: "#ff6b6b",
                minWidth: "auto",
                p: 0.5,
              }}
            >
              <Logout sx={{ fontSize: 24 }} />
            </Button>
          )}

          {/* Boutons seulement si pas en mode offline */}
          {!shouldUseOfflineMode && (
            <>
              {/* Bouton Administration (seulement pour les admins) */}
              {userProfile?.is_admin && (
                <NavLink to="/administration">
                  <AdminPanelSettings sx={{ fontSize: 28, color: "#fff", mt: 1 }} />
                </NavLink>
              )}
              
              <NavLink to="/account">
                <AccountCircle sx={{ fontSize: 28, color: "#fff", mt: 1 }} />
              </NavLink>
            </>
          )}
        </Box>
      </Box>

      {/* Bottom navbar mobile - SIMPLIFIÉ comme avant */}
      <Box
        sx={{
          position: "fixed",
          bottom: hasOfflineSupport() ? "env(safe-area-inset-bottom)" : 0,
          left: 0,
          right: 0,
          height: 56,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          bgcolor: "rgba(20,20,20,0.95)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          zIndex: 1200,
        }}
      >
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              flexDirection: "column",
              alignItems: "center",
              minWidth: "auto",
              color: "#fff",
              "&.active": { color: "#1DB954" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: "auto" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{ fontSize: "0.6rem", mt: -0.5 }}
            />
          </ListItemButton>
        ))}
      </Box>
    </>
  );
}


  // Desktop permanent sidebar
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 220,
          boxSizing: "border-box",
          background: "rgba(20,20,20,0.7)",
          backdropFilter: "blur(10px)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Box component="img" src={logo} alt="OpenZik logo" sx={{ width: 120, height: 70 }} />
      </Box>

      {/* Nav items en haut */}
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            sx={{
              "&.active": { color: "#1DB954" },
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      {/* Account en bas */}
      <Box sx={{ mt: "auto", mb: 2 }}>
        {/* Bouton Se déconnecter sur iOS quand connecté */}
        {canGoOffline && isOnline && !shouldUseOfflineMode && (
          <>
            <ListItemButton
              onClick={enableOfflineMode}
              sx={{
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                color: "#ff6b6b",
              }}
            >
              <ListItemIcon sx={{ color: "inherit" }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Se déconnecter" />
            </ListItemButton>
            <Divider sx={{ my: 1, bgcolor: "rgba(255,255,255,0.1)" }} />
          </>
        )}

        {/* Administration (seulement pour les admins et si pas en mode offline) */}
        {userProfile?.is_admin && !shouldUseOfflineMode && (
          <ListItemButton
            component={NavLink}
            to="/administration"
            sx={{
              "&.active": { color: "#1DB954" },
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <AdminPanelSettings />
            </ListItemIcon>
            <ListItemText primary="Administration" />
          </ListItemButton>
        )}
        
        {/* Account seulement si pas en mode offline */}
        {!shouldUseOfflineMode && (
          <ListItemButton
            component={NavLink}
            to="/account"
            sx={{
              "&.active": { color: "#1DB954" },
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText primary="Account" />
          </ListItemButton>
        )}
      </Box>
    </Drawer>
  );
}
