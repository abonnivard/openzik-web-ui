import React from "react";
import { List, Typography, Paper } from "@mui/material";
import UserItem from "./UserItem";

export default function UserList({ users = [] }) {
  if (!users.length) return null;

  return (
    <Paper sx={{ p: 1, bgcolor: "background.paper", mb: 2 }} elevation={0}>
      <Typography variant="h6" sx={{ mb: 1 }}>Profils</Typography>
      <List>
        {users.slice(0, 10).map((u) => (
          <UserItem key={u.id} user={u} />
        ))}
      </List>
    </Paper>
  );
}
