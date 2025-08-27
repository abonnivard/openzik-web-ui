import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { apiLogin, apiGetUserInfo, apiChangePassword } from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [mustChange, setMustChange] = useState(false);

  const handleLogin = async () => {
    setError("");
    try {
      // 1️⃣ Login classique pour récupérer le token temporaire
      const res = await apiLogin(username, password);

      // Stocker temporairement le token pour appeler apiGetUserInfo
      sessionStorage.setItem("token", res.token);

      // 2️⃣ Vérifier must_change_password
      const userInfo = await apiGetUserInfo();
      console.log("User info:", userInfo);
      if (userInfo.must_change_password) {
        setMustChange(true);
        return;
      }

      // 3️⃣ Sinon token final
      sessionStorage.setItem("token", res.token);

      onLogin();
    } catch (err) {
      setError(err.message || "Erreur serveur");
    }
  };

  const handleChangePassword = async () => {
    setError("");
    if (!newPassword || newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      // Utiliser le token temporaire pour changer le mot de passe
      const tempToken = sessionStorage.getItem("token");
      if (!tempToken) throw new Error("Session expirée, reconnectez-vous");

      sessionStorage.setItem("token", tempToken); // pour apiChangePassword
      await apiChangePassword(username, newPassword, password);

      // Après changement → login final
      const res = await apiLogin(username, newPassword);
      sessionStorage.setItem("token", res.token);
      setMustChange(false);
      onLogin();
    } catch (err) {
      setError(err.message || "Erreur lors du changement de mot de passe");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", p: 2, bgcolor: "#121212" }}>
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)", color: "#fff", width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#fff" }}>Login</Typography>

        {!mustChange ? (
          <>
            <TextField
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#fff" }, "&:hover fieldset": { borderColor: "#fff" }, "&.Mui-focused fieldset": { borderColor: "#fff" }, input: { color: "#fff" } }, "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 0.6 } }}
            />
            <TextField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#fff" }, "&:hover fieldset": { borderColor: "#fff" }, "&.Mui-focused fieldset": { borderColor: "#fff" }, input: { color: "#fff" } }, "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 0.6 } }}
            />
            <Button variant="contained" onClick={handleLogin} fullWidth sx={{ bgcolor: "#1db954", "&:hover": { bgcolor: "#1ed760" } }}>
              Login
            </Button>
          </>
        ) : (
          <>
            <Typography sx={{ color: "#fff" }}>Vous devez changer votre mot de passe</Typography>
            <TextField
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#fff" }, "&:hover fieldset": { borderColor: "#fff" }, "&.Mui-focused fieldset": { borderColor: "#fff" }, input: { color: "#fff" } }, "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 0.6 } }}
            />
            <TextField
              type="password"
              placeholder="Confirmer mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#fff" }, "&:hover fieldset": { borderColor: "#fff" }, "&.Mui-focused fieldset": { borderColor: "#fff" }, input: { color: "#fff" } }, "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 0.6 } }}
            />
            <Button variant="contained" onClick={handleChangePassword} fullWidth sx={{ bgcolor: "#1db954", "&:hover": { bgcolor: "#1ed760" } }}>
              Changer le mot de passe
            </Button>
          </>
        )}

        {error && <Typography sx={{ color: "red", mt: 1 }}>{error}</Typography>}
      </Paper>
    </Box>
  );
}
