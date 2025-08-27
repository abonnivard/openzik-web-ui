import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Home, Search, LibraryMusic, MenuBook, AccountCircle } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import logo from "./../assets/OpenZik-logo.png";

const navItems = [
  { label: "Home", path: "/", icon: <Home /> },
  { label: "Search", path: "/search", icon: <Search /> },
  { label: "My Library", path: "/library", icon: <MenuBook /> },
  { label: "Playlists", path: "/playlists", icon: <LibraryMusic /> },
];

export default function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
  return (
    <>
      {/* Bottom navbar mobile */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
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
      </Box>
    </Drawer>
  );
}
