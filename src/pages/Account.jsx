import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert, Stack } from "@mui/material";
import { apiGetUserInfo, apiUpdateUserInfo, apiChangePassword } from "./../api";

export default function Account({ setToast }) {
  const [user, setUser] = useState({ username: "", first_name: "", last_name: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [message, setMessage] = useState({ text: "", type: "success" });

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiGetUserInfo();
        setUser(data);
      } catch {
        setToast({ message: "Impossible de charger les infos", severity: "error" });
      }
    }
    fetchUser();
  }, []);

  const handleUpdateInfo = async () => {
    try {
      await apiUpdateUserInfo(user);
      setToast({ message: "Infos utilisateur mises à jour !", severity: "success" });
    } catch {
      setToast({ message: "Erreur lors de la mise à jour", severity: "error" });
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.new || passwords.new !== passwords.confirm) {
      setToast({ message: "Les mots de passe ne correspondent pas", severity: "error" });
      return;
    }
    try {
      await apiChangePassword(user.username, passwords.new, passwords.current);
      setPasswords({ current: "", new: "", confirm: "" });
      setToast({ message: "Mot de passe changé avec succès !", severity: "success" });
    } catch (err) {
      setToast({ message: err.message || "Erreur serveur", severity: "error" });
    }
  };

  const textFieldSx = {
    bgcolor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    "& .MuiInputLabel-root": {
      color: "#fff",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#fff",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
      "&:hover fieldset": { borderColor: "#1db954" },
      "&.Mui-focused fieldset": { borderColor: "#1db954" },
      color: "#fff",
    },
    "& .MuiInputBase-input": { color: "#fff" },
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center" }}>
      <Paper
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          bgcolor: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          width: { xs: "100%", md: 1000 },
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#fff" }}>
          Mon compte
        </Typography>

        {message.text && <Alert severity={message.type}>{message.text}</Alert>}

        <Stack spacing={3} mt={2}>
          <TextField
            label="Nom d'utilisateur"
            variant="outlined"
            fullWidth
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            sx={textFieldSx}
          />
          <TextField
            label="Prénom"
            variant="outlined"
            fullWidth
            value={user.first_name}
            onChange={(e) => setUser({ ...user, first_name: e.target.value })}
            sx={textFieldSx}
          />
          <TextField
            label="Nom"
            variant="outlined"
            fullWidth
            value={user.last_name}
            onChange={(e) => setUser({ ...user, last_name: e.target.value })}
            sx={textFieldSx}
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "#1db954", "&:hover": { bgcolor: "#1ed760" }, py: 1.5 }}
            onClick={handleUpdateInfo}
          >
            Sauvegarder
          </Button>
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 600, color: "#fff", mt: 4 }}>
          Changer le mot de passe
        </Typography>

        <Stack spacing={3} mt={2}>
          <TextField
            label="Mot de passe actuel"
            type="password"
            variant="outlined"
            fullWidth
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            sx={textFieldSx}
          />
          <TextField
            label="Nouveau mot de passe"
            type="password"
            variant="outlined"
            fullWidth
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            sx={textFieldSx}
          />
          <TextField
            label="Confirmer le mot de passe"
            type="password"
            variant="outlined"
            fullWidth
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            sx={textFieldSx}
          />
          <Button
            variant="contained"
            sx={{ bgcolor: "#1db954", "&:hover": { bgcolor: "#1ed760" }, py: 1.5 }}
            onClick={handleChangePassword}
          >
            Changer le mot de passe
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
