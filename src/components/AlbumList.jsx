// AlbumList.jsx
import React from "react";
import { List } from "@mui/material";
import AlbumItem from "./AlbumItem";

export default function AlbumList({ albums = [], onDownload }) {
  if (!albums.length) return <p></p>;

  return (
    <List>
      {albums.slice(0, 5).map((album) => (
        <AlbumItem key={album.id} album={album} onDownload={onDownload}/>
      ))}
    </List>
  );
}
