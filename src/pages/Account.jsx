import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress
} from "@mui/material";
import { Person, Lock, Edit, Storage, Settings, NetworkCheck } from "@mui/icons-material";
import { apiGetUserInfo, apiUpdateUserInfo, apiChangePassword, apiUploadProfileImage, apiRemoveProfileImage } from "./../api";
import ImageUploader from "../components/ImageUploader";
import { hasOfflineSupport } from '../utils/platform';
import configService from '../services/configService';
import NetworkDiagnostic from '../utils/networkDiagnostic';
import { useOfflineMode } from '../hooks/useOfflineMode';

export default function Account({ setToast }) {
  const [user, setUser] = useState({ username: "", first_name: "", last_name: "", profile_image: null });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [editMode, setEditMode] = useState(false);
  
  // Hook pour le mode offline et la connectivité serveur
  const { isServerReachable, checkServerConnectivity } = useOfflineMode();
  
  // États pour la configuration du serveur
  const [serverConfigDialog, setServerConfigDialog] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState("");
  const [currentServerUrl, setCurrentServerUrl] = useState("");
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);

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
    
    // Charger l'URL du serveur actuelle si on est sur iOS
    if (hasOfflineSupport()) {
      setCurrentServerUrl(configService.getServerUrl());
    }
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

  // Fonctions pour la configuration du serveur (iOS uniquement)
  const handleServerConfigOpen = () => {
    setNewServerUrl(currentServerUrl);
    setDiagnosticResults(null);
    setServerConfigDialog(true);
  };

  const runNetworkDiagnostic = async () => {
    if (!newServerUrl.trim()) {
      setToast({ message: "Please enter a server URL to test", severity: "error" });
      return;
    }

    setRunningDiagnostic(true);
    try {
      const results = await NetworkDiagnostic.testConnectivity(newServerUrl.trim());
      setDiagnosticResults(results);
      
      const report = NetworkDiagnostic.formatResults(results);
      console.log('Network Diagnostic Report:', report);
      
      // Afficher un résumé
      const successfulTests = results.tests.filter(t => t.success).length;
      const totalTests = results.tests.length;
      
      if (successfulTests === totalTests) {
        setToast({ message: `All tests passed (${successfulTests}/${totalTests})`, severity: "success" });
      } else if (successfulTests > 0) {
        setToast({ message: `Some tests passed (${successfulTests}/${totalTests})`, severity: "warning" });
      } else {
        setToast({ message: `All tests failed (0/${totalTests})`, severity: "error" });
      }
    } catch (error) {
      setToast({ message: `Diagnostic failed: ${error.message}`, severity: "error" });
    } finally {
      setRunningDiagnostic(false);
    }
  };

  const handleServerConfigSave = async () => {
    if (!newServerUrl.trim()) {
      setToast({ message: "Please enter a server URL", severity: "error" });
      return;
    }

    try {
      const result = await configService.testConnection(newServerUrl.trim());
      
      if (result.success) {
        configService.setServerUrl(newServerUrl.trim());
        setCurrentServerUrl(newServerUrl.trim());
        setServerConfigDialog(false);
        setDiagnosticResults(null);
        setToast({ message: "Server configuration updated successfully ✅", severity: "success" });
        
        // Recharger l'app après changement de serveur
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setToast({ message: `Connection failed: ${result.message}`, severity: "error" });
      }
    } catch (error) {
      setToast({ message: `Error: ${error.message}`, severity: "error" });
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

        {/* Server Configuration - iOS Only */}
        {hasOfflineSupport() && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: "#1a1a1a", border: "1px solid #333" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Storage sx={{ color: "#1db954", mr: 2 }} />
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600, flex: 1 }}>
                    Server Configuration
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    px: 2,
                    py: 0.5,
                    bgcolor: isServerReachable ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                    borderRadius: 1,
                    border: `1px solid ${isServerReachable ? 'rgba(76,175,80,0.3)' : 'rgba(255,152,0,0.3)'}`
                  }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: isServerReachable ? '#4caf50' : '#ff9800' 
                    }} />
                    <Typography variant="caption" sx={{ 
                      color: isServerReachable ? '#4caf50' : '#ff9800',
                      fontWeight: 600
                    }}>
                      {isServerReachable ? 'Connected' : 'Disconnected'}
                    </Typography>
                  </Box>
                </Box>

                <Alert 
                  severity={isServerReachable ? "info" : "warning"}
                  sx={{ 
                    mb: 3,
                    bgcolor: isServerReachable 
                      ? 'rgba(29,185,84,0.1)' 
                      : 'rgba(255,152,0,0.1)',
                    border: `1px solid ${isServerReachable 
                      ? 'rgba(29,185,84,0.3)' 
                      : 'rgba(255,152,0,0.3)'}`,
                    color: '#fff',
                    '& .MuiAlert-icon': { 
                      color: isServerReachable ? '#1db954' : '#ff9800' 
                    }
                  }}
                >
                  Current server: {currentServerUrl}
                  {!isServerReachable && (
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                      Server is currently unreachable. You can still change server configuration.
                    </Typography>
                  )}
                </Alert>

                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    variant="outlined"
                    startIcon={<NetworkCheck />}
                    onClick={checkServerConnectivity}
                    sx={{
                      borderColor: "#ff9800",
                      color: "#ff9800",
                      "&:hover": { 
                        borderColor: "#ffa726",
                        color: "#ffa726",
                        bgcolor: "rgba(255,152,0,0.1)"
                      },
                      fontWeight: 600,
                      px: 3,
                      flex: { xs: 1, sm: 'none' }
                    }}
                  >
                    Test Connection
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={handleServerConfigOpen}
                    sx={{
                      borderColor: "#1db954",
                      color: "#1db954",
                      "&:hover": { 
                        borderColor: "#1ed760",
                        color: "#1ed760",
                        bgcolor: "rgba(29,185,84,0.1)"
                      },
                      fontWeight: 600,
                      px: 3,
                      flex: { xs: 1, sm: 'none' }
                    }}
                  >
                    Change Server
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Server Configuration Dialog - iOS Only */}
      {hasOfflineSupport() && (
        <Dialog
          open={serverConfigDialog}
          onClose={() => setServerConfigDialog(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: '#1a1a1a',
              color: 'white',
              borderRadius: 3,
              border: '1px solid #333'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#fff',
            borderBottom: '1px solid #333',
            pb: 2
          }}>
            <Storage sx={{ color: '#1db954' }} />
            Change Server Configuration
          </DialogTitle>
          
          <DialogContent sx={{ py: 3 }}>
            <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 1 }}>
              Enter the new server URL. The app will reload after successful connection.
            </Typography>
            
            {!isServerReachable && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  bgcolor: 'rgba(33,150,243,0.1)',
                  border: '1px solid rgba(33,150,243,0.3)',
                  color: '#fff',
                  '& .MuiAlert-icon': { color: '#2196f3' }
                }}
              >
                Current server is unreachable. You can change to a different server.
              </Alert>
            )}
            
            
            <TextField
              fullWidth
              label="Server URL"
              placeholder="http://192.168.1.100:3000"
              value={newServerUrl}
              onChange={(e) => setNewServerUrl(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#1a1a1a',
                  color: '#fff',
                  '& fieldset': { borderColor: '#333' },
                  '&:hover fieldset': { borderColor: '#555' },
                  '&.Mui-focused fieldset': { borderColor: '#1db954' },
                },
                '& .MuiInputLabel-root': { color: '#b3b3b3' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1db954' },
              }}
            />
            
            {diagnosticResults && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#1a1a1a', borderRadius: 2, border: '1px solid #333' }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NetworkCheck sx={{ color: '#ffb74d' }} />
                  Diagnostic Results
                </Typography>
                
                {diagnosticResults.tests.map((test, index) => (
                  <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ color: test.success ? '#4caf50' : '#f44336', minWidth: '20px' }}>
                      {test.success ? '✅' : '❌'}
                    </Typography>
                    <Typography sx={{ color: '#fff', flex: 1 }}>
                      {test.name}
                    </Typography>
                    {test.status && (
                      <Chip 
                        label={test.status} 
                        size="small" 
                        sx={{ 
                          bgcolor: test.success ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)',
                          color: test.success ? '#4caf50' : '#f44336',
                          fontSize: '0.75rem'
                        }} 
                      />
                    )}
                  </Box>
                ))}
                
                <Typography variant="caption" sx={{ color: '#b3b3b3', mt: 2, display: 'block' }}>
                  Check console for detailed report
                </Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions 
            sx={{ 
              p: 3, 
              borderTop: '1px solid #333',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'stretch'
            }}
          >
            {/* Bouton diagnostic au-dessus */}
            <Button 
              onClick={runNetworkDiagnostic}
              disabled={runningDiagnostic}
              startIcon={runningDiagnostic ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <NetworkCheck />}
              fullWidth
              variant="outlined"
              sx={{
                color: '#ffb74d',
                borderColor: '#ffb74d',
                '&:hover': { borderColor: '#ffa726', bgcolor: 'rgba(255,183,77,0.1)' },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5
              }}
            >
              {runningDiagnostic ? 'Testing...' : 'Run Network Diagnostic'}
            </Button>
            
            {/* Boutons d'action en bas */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: '100%'
            }}>
              <Button 
                onClick={() => setServerConfigDialog(false)}
                fullWidth
                sx={{
                  color: '#b3b3b3',
                  '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' },
                  py: 1.5,
                  order: { xs: 2, sm: 1 }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleServerConfigSave}
                variant="contained"
                startIcon={<Storage />}
                fullWidth
                sx={{
                  bgcolor: '#1db954',
                  color: 'white',
                  '&:hover': { bgcolor: '#1ed760' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  order: { xs: 1, sm: 2 }
                }}
              >
                Test & Save
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
