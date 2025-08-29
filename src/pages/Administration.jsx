import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  Tooltip,
  Alert,
  Avatar
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Person,
  AdminPanelSettings,
  Group,
  MusicNote,
  Album,
  QueueMusic,
  Storage,
  Settings
} from "@mui/icons-material";
import {
  apiGetAllUsers,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  apiGetAdminStats
} from "../api";
import { hasOfflineSupport } from '../utils/platform';
import configService from '../services/configService';

export default function Administration({ setToast }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ users: 0, tracks: 0, albums: 0, playlists: 0 });
  const [loading, setLoading] = useState(true);
  const [serverConfigDialog, setServerConfigDialog] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState("");
  const [currentServerUrl, setCurrentServerUrl] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    is_admin: false
  });

  // Styles pour les TextFields
  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
      "&:hover fieldset": { borderColor: "#1db954" },
      "&.Mui-focused fieldset": { borderColor: "#1db954" },
      "&.Mui-disabled": {
        color: "rgba(255,255,255,0.9)",
        "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
        bgcolor: "rgba(255,255,255,0.05)"
      }
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#1db954" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "rgba(255,255,255,0.6)" },
    "& .MuiInputBase-input.Mui-disabled": { 
      WebkitTextFillColor: "rgba(255,255,255,0.9)",
      color: "rgba(255,255,255,0.9)"
    }
  };

  const loadData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        apiGetAllUsers(),
        apiGetAdminStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error(error);
      setToast({ message: "Error loading admin data ❌", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Charger l'URL du serveur actuelle si on est sur iOS
    if (hasOfflineSupport()) {
      setCurrentServerUrl(configService.getServerUrl());
    }
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      first_name: "",
      last_name: "",
      password: "",
      is_admin: false
    });
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      password: "",
      is_admin: user.is_admin
    });
    setOpenDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // Modifier l'utilisateur existant
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_admin: formData.is_admin
        };
        await apiUpdateUser(editingUser.id, updateData);
        setToast({ message: "User updated successfully ✅", severity: "success" });
      } else {
        // Créer un nouvel utilisateur
        if (!formData.username || !formData.password) {
          setToast({ message: "Username and password are required ❌", severity: "error" });
          return;
        }
        await apiCreateUser(formData);
        setToast({ message: "User created successfully ✅", severity: "success" });
      }
      
      setOpenDialog(false);
      loadData();
    } catch (error) {
      console.error(error);
      setToast({ message: error.message || "Error saving user ❌", severity: "error" });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        await apiDeleteUser(userId);
        setToast({ message: "User deleted successfully ✅", severity: "success" });
        loadData();
      } catch (error) {
        console.error(error);
        setToast({ message: error.message || "Error deleting user ❌", severity: "error" });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Fonctions pour la configuration du serveur (iOS uniquement)
  const handleServerConfigOpen = () => {
    setNewServerUrl(currentServerUrl);
    setServerConfigDialog(true);
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
        setToast({ message: "Server configuration updated successfully ✅", severity: "success" });
        
        // Recharger l'app après changement de serveur
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setToast({ message: `Connection failed: ${result.message}`, severity: "error" });
      }
    } catch (error) {
      setToast({ message: `Connection failed: ${error.message}`, severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 12 }}>
      {/* Header */}
      <Box sx={{ 
        display: "flex", 
        alignItems: { xs: "flex-start", sm: "center" }, 
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AdminPanelSettings sx={{ color: "#1db954", fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
            Administration
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateUser}
          sx={{
            bgcolor: "#1db954",
            "&:hover": { bgcolor: "#1ed760" },
            fontWeight: 600,
            alignSelf: { xs: "stretch", sm: "auto" }
          }}
        >
          New User
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        {[
          { title: "Users", value: stats.users, icon: Group, color: "#1db954" },
          { title: "Tracks", value: stats.tracks, icon: MusicNote, color: "#ff6b6b" },
          { title: "Albums", value: stats.albums, icon: Album, color: "#4ecdc4" },
          { title: "Playlists", value: stats.playlists, icon: QueueMusic, color: "#45b7d1" }
        ].map((stat, index) => (
          <Grid item sx={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                height: "100%",
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
                <stat.icon sx={{ fontSize: 32, color: stat.color }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
                    {stat.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    {stat.title}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Server Configuration - iOS Only */}
      {hasOfflineSupport() && (
        <Card
          sx={{
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)"
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Storage sx={{ color: "#1db954", mr: 2 }} />
              <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                Server Configuration
              </Typography>
            </Box>

            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(29,185,84,0.1)',
                border: '1px solid rgba(29,185,84,0.3)',
                color: '#fff',
                '& .MuiAlert-icon': { color: '#1db954' }
              }}
            >
              Current server: {currentServerUrl}
            </Alert>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
                    bgcolor: "rgba(29,185,84,0.05)"
                  },
                  fontWeight: 600,
                  px: 4
                }}
              >
                Change Server
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card
        sx={{
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)"
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: "#fff" }}>
            Users Management
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Username</TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Created at</TableCell>
                  <TableCell sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.02)" } }}>
                    <TableCell sx={{ color: "#fff" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {user.profile_image ? (
                          <Avatar
                            src={user.profile_image}
                            sx={{
                              width: 40,
                              height: 40,
                              border: user.is_admin ? "2px solid #1db954" : "2px solid rgba(255,255,255,0.3)"
                            }}
                          />
                        ) : (
                          <Person 
                            sx={{ 
                              color: user.is_admin ? "#1db954" : "rgba(255,255,255,0.6)",
                              padding: "2px",
                              borderRadius: "50%",
                              border: user.is_admin ? "2px solid #1db954" : "none",
                              width: 40,
                              height: 40
                            }} 
                          />
                        )}
                        {user.username}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "#fff" }}>
                      {user.first_name || user.last_name 
                        ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                        : "—"
                      }
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_admin ? "Admin" : "User"}
                        size="small"
                        sx={{
                          bgcolor: user.is_admin ? "rgba(29,185,84,0.2)" : "rgba(255,255,255,0.1)",
                          color: user.is_admin ? "#1db954" : "rgba(255,255,255,0.7)",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.must_change_password ? "Must Change Password" : "Active"}
                        size="small"
                        sx={{
                          bgcolor: user.must_change_password ? "rgba(255,107,107,0.2)" : "rgba(76,175,80,0.2)",
                          color: user.must_change_password ? "#ff6b6b" : "#4caf50",
                        }}
                      />
                    </TableCell>
                     <TableCell>
                      <Chip
                        label={user.created_at ? formatDate(user.created_at) : "No data"}
                        size="small"
                        sx={{
                          bgcolor: user.created_at ? "rgba(29,185,84,0.2)" : "rgba(255,107,107,0.2)",
                          color: user.created_at ? "#1db954" : "#ff6b6b",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            sx={{ color: "#1db954" }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            sx={{ color: "#ff6b6b" }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "rgba(30,30,30,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          }
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontWeight: 600 }}>
          {editingUser ? "Edit User" : "Create New User"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            {!editingUser && (
              <Alert severity="info" sx={{ bgcolor: "rgba(29,185,84,0.1)", color: "#1db954" }}>
                New users will be required to change their password on first login.
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  fullWidth
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  sx={textFieldSx}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  sx={textFieldSx}
                />
              </Grid>
              
              {!editingUser && (
                <Grid item xs={12}>
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    sx={textFieldSx}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_admin}
                      onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#1db954" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#1db954" },
                      }}
                    />
                  }
                  label="Administrator privileges"
                  sx={{ color: "#fff" }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: "rgba(255,255,255,0.7)" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            sx={{ bgcolor: "#1db954", "&:hover": { bgcolor: "#1ed760" } }}
          >
            {editingUser ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Server Configuration Dialog - iOS Only */}
      {hasOfflineSupport() && (
        <Dialog 
          open={serverConfigDialog} 
          onClose={() => setServerConfigDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: '#121212',
              backgroundImage: 'none',
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
            <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 3 }}>
              Enter the new server URL. The app will reload after successful connection.
            </Typography>
            
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
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid #333' }}>
            <Button 
              onClick={() => setServerConfigDialog(false)}
              sx={{
                color: '#b3b3b3',
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleServerConfigSave}
              variant="contained"
              startIcon={<Storage />}
              sx={{
                bgcolor: '#1db954',
                color: 'white',
                '&:hover': { bgcolor: '#1ed760' },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Test & Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
