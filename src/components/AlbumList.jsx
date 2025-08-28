// AlbumList.jsx
import React from "react";
import { List } from "@mui/material";
import AlbumItem from "./AlbumItem";

export default function AlbumList({ albums = [], onDownload, onPlayAlbum, onAlbumClick, setToast }) {
  if (!albums || !Array.isArray(albums) || !albums.length) return null;

  return (
    <List>
      {albums.slice(0, 5).map((album, index) => (
        <AlbumItem 
          key={album.id || `album-${index}`} 
          album={album} 
          onDownload={onDownload}
          onPlayAlbum={onPlayAlbum}
          onAlbumClick={onAlbumClick}
          setToast={setToast}
        />
      ))}
    </List>
  );
}
