import React, { useState } from "react";
import {
  Box,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import {
  PhotoCamera,
  Delete,
  Edit
} from "@mui/icons-material";

export default function ImageUploader({
  currentImage,
  onImageUpload,
  onImageRemove,
  size = 100,
  isRound = true,
  label = "Upload Image",
  disabled = false
}) {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    // Convertir en base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      onImageUpload(base64Data).finally(() => {
        setUploading(false);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <>
      <Box sx={{ position: "relative", display: "inline-block" }}>
        {isRound ? (
          <Avatar
            src={currentImage}
            sx={{ 
              width: size, 
              height: size, 
              cursor: currentImage ? "pointer" : "default",
              bgcolor: "rgba(255,255,255,0.1)",
              fontSize: size / 4
            }}
            onClick={() => currentImage && setPreviewOpen(true)}
          >
            {!currentImage && <PhotoCamera sx={{ fontSize: size / 3 }} />}
          </Avatar>
        ) : (
          <Box
            sx={{
              width: size,
              height: size,
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentImage ? "pointer" : "default",
              overflow: "hidden",
              border: "2px dashed rgba(255,255,255,0.3)"
            }}
            onClick={() => currentImage && setPreviewOpen(true)}
          >
            {currentImage ? (
              <img 
                src={currentImage} 
                alt="Preview" 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover" 
                }} 
              />
            ) : (
              <PhotoCamera sx={{ fontSize: size / 3, color: "rgba(255,255,255,0.5)" }} />
            )}
          </Box>
        )}

        {/* Boutons d'action */}
        <Box
          sx={{
            position: "absolute",
            bottom: -8,
            right: -8,
            display: "flex",
            gap: 0.5
          }}
        >
          {/* Bouton Upload/Edit */}
          <IconButton
            component="label"
            size="small"
            disabled={disabled || uploading}
            sx={{
              bgcolor: "#1db954",
              color: "#fff",
              "&:hover": { bgcolor: "#1ed760" },
              "&:disabled": { bgcolor: "rgba(255,255,255,0.1)" }
            }}
          >
            {uploading ? (
              <CircularProgress size={16} sx={{ color: "#fff" }} />
            ) : currentImage ? (
              <Edit fontSize="small" />
            ) : (
              <PhotoCamera fontSize="small" />
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || uploading}
            />
          </IconButton>

          {/* Bouton Remove */}
          {currentImage && onImageRemove && (
            <IconButton
              size="small"
              onClick={handleRemove}
              disabled={disabled}
              sx={{
                bgcolor: "#ff6b6b",
                color: "#fff",
                "&:hover": { bgcolor: "#ff5252" }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Dialog de prévisualisation */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: "rgba(30,30,30,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          }
        }}
      >
        <DialogTitle sx={{ color: "#fff" }}>
          Image Preview
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <img
              src={currentImage}
              alt="Full size preview"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain"
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPreviewOpen(false)}
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
