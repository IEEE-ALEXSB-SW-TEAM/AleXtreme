import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const NotificationPopup = ({ notification, onClose }) => {
  const navigate = useNavigate();

  if (!notification) {
    return null;
  }

  const handleGoToClarifications = () => {
    onClose();

    if (notification.isAdmin) {
      navigate("/admin/clarifications");
    } else {
      navigate("/clarifications");
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: "14px",
          padding: "0.5rem",
        },
      }}
    >
      <DialogTitle
        style={{
          color: "#0F044C",
          fontWeight: "bold",
          fontSize: "1.5rem",
          textAlign: "center",
        }}
      >
        🔔 {notification.title}
      </DialogTitle>

      <DialogContent>
        <Typography
          style={{
            color: "#333333",
            fontSize: "1rem",
            lineHeight: "1.6",
            textAlign: "center",
            padding: "0.5rem 1rem",
          }}
        >
          {notification.message}
        </Typography>
      </DialogContent>

      <DialogActions
        style={{
          justifyContent: "center",
          gap: "1rem",
          padding: "1rem",
        }}
      >
        <Button
          variant="contained"
          onClick={handleGoToClarifications}
          style={{
            backgroundColor: "#141E61",
            color: "white",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.2rem",
          }}
        >
          Go to Clarifications
        </Button>

        <Button
          variant="outlined"
          onClick={onClose}
          style={{
            color: "#141E61",
            borderColor: "#141E61",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.2rem",
          }}
        >
          Exit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPopup;