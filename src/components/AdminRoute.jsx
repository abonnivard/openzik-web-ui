import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";
import { apiGetUserProfile } from "../api";

export default function AdminRoute({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await apiGetUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "50vh",
        flexDirection: "column",
        gap: 2
      }}>
        <CircularProgress sx={{ color: "#1db954" }} />
        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  if (!userProfile?.is_admin) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "50vh",
        gap: 3
      }}>
        <AdminPanelSettings sx={{ fontSize: 80, color: "rgba(255,255,255,0.3)" }} />
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" sx={{ color: "#fff", fontWeight: 700, mb: 1 }}>
            Access Denied
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
            You need administrator privileges to access this page.
          </Typography>
        </Box>
      </Box>
    );
  }

  return children;
}
