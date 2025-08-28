import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Divider,
  Avatar,
  IconButton
} from "@mui/material";
import { Person, Lock, Edit } from "@mui/icons-material";
import { apiGetUserInfo, apiUpdateUserInfo, apiChangePassword, apiUploadProfileImage, apiRemoveProfileImage } from "./../api";
import ImageUploader from "../components/ImageUploader";

export default function Account({ setToast }) {
  const [user, setUser] = useState({ username: "", first_name: "", last_name: "", profile_image: null });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiGetUserInfo();
        setUser(data);
      } catch {
        setToast({ message: "Unable to load user info", severity: "error" });
      }
    }
    fetchUser();
  }, [setToast]);

  const handleUpdateInfo = async () => {
    try {
      await apiUpdateUserInfo(user);
      setEditMode(false);
      setToast({ message: "Profile updated successfully ✅", severity: "success" });
    } catch {
      setToast({ message: "Error updating profile ❌", severity: "error" });
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.new || passwords.new !== passwords.confirm) {
      setToast({ message: "Passwords do not match ❌", severity: "error" });
      return;
    }
    try {
      await apiChangePassword(user.username, passwords.new, passwords.current);
      setPasswords({ current: "", new: "", confirm: "" });
      setToast({ message: "Password changed successfully ✅", severity: "success" });
    } catch (err) {
      setToast({ message: err.message || "Server error ❌", severity: "error" });
    }
  };

  const handleProfileImageUpload = async (imageData) => {
    try {
      await apiUploadProfileImage(imageData);
      setUser(prev => ({ ...prev, profile_image: imageData }));
      setToast({ message: "Profile image updated successfully ✅", severity: "success" });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      setToast({ message: "Error uploading profile image ❌", severity: "error" });
    }
  };

  const handleProfileImageRemove = async () => {
    try {
      await apiRemoveProfileImage();
      setUser(prev => ({ ...prev, profile_image: null }));
      setToast({ message: "Profile image removed successfully ✅", severity: "success" });
    } catch (error) {
      console.error("Error removing profile image:", error);
      setToast({ message: "Error removing profile image ❌", severity: "error" });
    }
  };


  const textFieldSx = {
    bgcolor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
      "&.Mui-focused fieldset": { borderColor: "#1db954" },
      "&.Mui-disabled": {
        color: "rgba(255,255,255,0.95)", // Texte plus visible quand disabled
        "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
        bgcolor: "rgba(255,255,255,0.08)" // Background légèrement plus visible
      }
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#1db954" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "rgba(255,255,255,0.7)" },
    "& .MuiInputBase-input.Mui-disabled": { 
      WebkitTextFillColor: "rgba(255,255,255,0.95)", // Force la couleur même en disabled
      color: "rgba(255,255,255,0.95)" // Couleur de fallback
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        pb: 12,
        maxWidth: { xs: "100%", md: 1200 },
        mx: "auto"
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
          My Account
        </Typography>
      </Box>

      {/* Mobile: Profile Preview First */}
      <Box sx={{ display: { xs: "block", lg: "none" }}}>
        <Card
          sx={{
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)"
          }}
        >
          <CardContent sx={{ p: 3, textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <ImageUploader
                currentImage={user.profile_image}
                onImageUpload={handleProfileImageUpload}
                onImageRemove={handleProfileImageRemove}
                size={80}
                isRound={true}
                label="Profile Picture"
              />
            </Box>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
              {user.first_name || user.last_name 
                ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                : user.username || "User"
              }
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              @{user.username}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Person sx={{ color: "#1db954", fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
                    Personal Information
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setEditMode(!editMode)}
                  sx={{ 
                    color: editMode ? "#1db954" : "rgba(255,255,255,0.7)",
                    bgcolor: editMode ? "rgba(29,185,84,0.1)" : "rgba(255,255,255,0.05)"
                  }}
                >
                  <Edit />
                </IconButton>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} width="100%">
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    disabled={!editMode}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6} width="100%">
                  <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    value={user.first_name}
                    onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                    disabled={!editMode}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6} width="100%">
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    value={user.last_name}
                    onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                    disabled={!editMode}
                    sx={textFieldSx}
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box sx={{ 
                  display: "flex", 
                  gap: 2, 
                  mt: 3, 
                  justifyContent: { xs: "stretch", sm: "flex-end" },
                  flexDirection: { xs: "column", sm: "row" }
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => setEditMode(false)}
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      borderColor: "rgba(255,255,255,0.3)",
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.5)",
                        bgcolor: "rgba(255,255,255,0.05)"
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateInfo}
                    sx={{
                      bgcolor: "#1db954",
                      "&:hover": { bgcolor: "#1ed760" },
                      fontWeight: 600
                    }}
                  >
                    Save Changes
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Desktop: Profile Preview */}
        <Grid item xs={12} lg={4} sx={{ display: { xs: "none", lg: "block" } }}>
          <Card
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <ImageUploader
                  currentImage={user.profile_image}
                  onImageUpload={handleProfileImageUpload}
                  onImageRemove={handleProfileImageRemove}
                  size={80}
                  isRound={true}
                  label="Profile Picture"
                />
              </Box>
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
                {user.first_name || user.last_name 
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                  : user.username || "User"
                }
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                @{user.username}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Section */}
        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor: "rgba(255,255,255,0.05)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)"
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Lock sx={{ color: "#1db954", fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
                  Security
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4} width="100%">
                  <TextField
                    label="Current Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={4} width="100%">
                  <TextField
                    label="New Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    sx={textFieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={4} width="100%">
                  <TextField
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    sx={textFieldSx}
                  />
                </Grid>
              </Grid>

              <Box sx={{ 
                display: "flex", 
                justifyContent: { xs: "stretch", md: "flex-end" }, 
                mt: 3,
                flexDirection: { xs: "column", sm: "row" }
              }}>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={!passwords.current || !passwords.new || !passwords.confirm}
                  sx={{
                    bgcolor: "#1db954",
                    "&:hover": { bgcolor: "#1ed760" },
                    "&:disabled": { 
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.3)"
                    },
                    fontWeight: 600,
                    px: 4,
                    width: { xs: "100%", sm: "auto" }
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
