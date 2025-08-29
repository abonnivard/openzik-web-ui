import React, { useState } from "react";
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  IconButton,
  InputAdornment,
  LinearProgress,
  Fade
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon, Lock } from "@mui/icons-material";
import { apiLogin, apiGetUserInfo, apiChangePassword } from "../api";
import authStorage from "../services/authStorage";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mustChange, setMustChange] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleKeyPress = (event, action) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      action();
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);
    
    try {
      // 1️⃣ Login classique pour récupérer le token temporaire
      console.log("Attempting login...");
      const res = await apiLogin(username, password);
      console.log("Login successful:", res);

      // Stocker temporairement le token pour appeler apiGetUserInfo
      authStorage.setToken(res.token);

      // 2️⃣ Vérifier must_change_password
      console.log("Getting user info...");
      const userInfo = await apiGetUserInfo();
      console.log("User info:", userInfo);
      if (userInfo.must_change_password) {
        setMustChange(true);
        setLoading(false);
        return;
      }

      // 3️⃣ Sinon token final et profil
      authStorage.setToken(res.token);
      authStorage.setUserProfile(userInfo);
      onLogin();
    } catch (err) {
      console.log("Login error caught:", err);
      setError(err.message || "Connection error. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const tempToken = authStorage.getToken();
      if (!tempToken) throw new Error("Session expired, please log in again");

      await apiChangePassword(username, newPassword, password);

      const res = await apiLogin(username, newPassword);
      sessionStorage.setItem("token", res.token);
      setMustChange(false);
      onLogin();
    } catch (err) {
      setError(err.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 2,
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255,255,255,0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1db954",
        borderWidth: 2,
      },
      "& input": {
        color: "#fff",
      },
    },
    "& .MuiInputBase-input::placeholder": {
      color: "rgba(255,255,255,0.7)",
      opacity: 1,
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.7)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#1db954",
    },
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh", 
        p: 2, 
        bgcolor: "#121212",
      }}
    >
      <Paper 
        elevation={10}
        sx={{ 
          p: 5, 
          borderRadius: 4, 
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff", 
          width: "100%", 
          maxWidth: 420,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading && (
          <LinearProgress 
            sx={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0,
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#1db954",
              }
            }} 
          />
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {!mustChange ? (
              <LoginIcon sx={{ fontSize: 48, color: "#1db954", mb: 1 }} />
            ) : (
              <Lock sx={{ fontSize: 48, color: "#ff9800", mb: 1 }} />
            )}
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: "#fff",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}
            >
              {!mustChange ? "Login" : "Change Password"}
            </Typography>
            {!mustChange && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "rgba(255,255,255,0.7)", 
                  mt: 1 
                }}
              >
                Sign in to your account
              </Typography>
            )}
          </Box>

          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  backgroundColor: "rgba(211, 47, 47, 0.2)",
                  color: "#fff",
                  border: "1px solid rgba(211, 47, 47, 0.5)",
                  "& .MuiAlert-icon": {
                    color: "#ff5252"
                  }
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {!mustChange ? (
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                fullWidth
                disabled={loading}
                sx={textFieldSx}
              />
              
              <TextField
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                fullWidth
                disabled={loading}
                sx={textFieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button 
                variant="contained" 
                onClick={handleLogin} 
                disabled={loading}
                fullWidth 
                sx={{ 
                  bgcolor: "#1db954", 
                  "&:hover": { bgcolor: "#1ed760" },
                  "&:disabled": { bgcolor: "rgba(29, 185, 84, 0.3)" },
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "0 4px 8px rgba(29, 185, 84, 0.3)",
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Box>
          ) : (
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Alert 
                severity="warning" 
                sx={{ 
                  backgroundColor: "rgba(255, 152, 0, 0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255, 152, 0, 0.5)",
                  "& .MuiAlert-icon": {
                    color: "#ff9800"
                  }
                }}
              >
                You must change your password to continue
              </Alert>
              
              <TextField
                type={showNewPassword ? "text" : "password"}
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleChangePassword)}
                fullWidth
                disabled={loading}
                sx={textFieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleChangePassword)}
                fullWidth
                disabled={loading}
                sx={textFieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Button 
                variant="contained" 
                onClick={handleChangePassword} 
                disabled={loading}
                fullWidth 
                sx={{ 
                  bgcolor: "#ff9800", 
                  "&:hover": { bgcolor: "#ffa726" },
                  "&:disabled": { bgcolor: "rgba(255, 152, 0, 0.3)" },
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: "none",
                  boxShadow: "0 4px 8px rgba(255, 152, 0, 0.3)",
                }}
              >
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
