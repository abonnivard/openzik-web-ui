import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip
} from "@mui/material";
import { Person, Verified } from "@mui/icons-material";

export default function UserList({ users }) {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return null;
  }

  const handleUserClick = (user) => {
    if (user.external_urls?.spotify) {
      window.open(user.external_urls.spotify, '_blank');
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {users.map((user) => (
        <Card
          key={user.id}
          sx={{
            bgcolor: "rgba(255,255,255,0.05)",
            color: "#fff",
            cursor: user.external_urls?.spotify ? "pointer" : "default",
            "&:hover": user.external_urls?.spotify ? {
              bgcolor: "rgba(255,255,255,0.1)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease"
            } : {}
          }}
          onClick={() => handleUserClick(user)}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
            <Avatar
              src={user.images?.[0]?.url}
              sx={{ width: 50, height: 50 }}
            >
              <Person />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user.display_name || user.id}
                </Typography>
                {user.verified && (
                  <Verified sx={{ color: "#1db954", fontSize: 20 }} />
                )}
              </Box>
              
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {user.followers?.total && (
                  <Chip
                    label={`${user.followers.total.toLocaleString()} followers`}
                    size="small"
                    sx={{
                      bgcolor: "rgba(29,185,84,0.2)",
                      color: "#1db954",
                      fontSize: "0.75rem"
                    }}
                  />
                )}
                
                <Chip
                  label="Utilisateur Spotify"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "0.75rem"
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}