import React from "react";
import { TextField, Button, Box } from "@mui/material";

export default function SearchBar({ query, setQuery, onSearch }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1.5,
        mb: 3,
      }}
    >
      <TextField
        label="Search music, artist or album"
        variant="filled"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        sx={{
          flex: 1,
          bgcolor: "#2A2A2A",
          borderRadius: 2,
          input: { color: "#fff" },
          "& .MuiInputLabel-root": { color: "#aaa" },
          "& .MuiFilledInput-root:after": { borderBottom: "2px solid #1DB954" }, // focus vert
          "& .MuiFilledInput-root:hover:before": { borderBottom: "2px solid #1DB954" }, // hover vert
        }}
      />
      <Button
        variant="contained"
        onClick={onSearch}
        sx={{
          bgcolor: "#1DB954",
          "&:hover": { bgcolor: "#1ed760" },
          minWidth: { xs: "100%", sm: "120px" },
        }}
      >
        Search
      </Button>
    </Box>
  );
}
