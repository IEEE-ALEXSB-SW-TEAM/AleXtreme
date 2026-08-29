import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  getAllClarifications,
  respondToClarification,
  createAnnouncement,
} from "../services/clarificationService";

import { CONTEST_ID } from "../config/config";

export const AdminClarifications = () => {
  const [clarifications, setClarifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replyOpen, setReplyOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);

  const [selectedClarification, setSelectedClarification] =
    useState(null);

  const [replyMessage, setReplyMessage] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");

  const [announcementMessage, setAnnouncementMessage] =
    useState("");

  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("adminToken");

  // ============================================================
  // LOAD CLARIFICATIONS
  // ============================================================

  const loadClarifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllClarifications(token);

      setClarifications(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("You must be logged in as an administrator.");
      setLoading(false);
      return;
    }

    loadClarifications();
  }, []);

  // ============================================================
  // GROUP CLARIFICATIONS
  // ============================================================

  const groupedClarifications = Object.values(
    clarifications.reduce((groups, item) => {
      if (!groups[item.id]) {
        groups[item.id] = {
          id: item.id,
          contest_id: item.contest_id,
          team_id: item.team_id,
          team_name: item.team_name,
          problem_id: item.problem_id,
          status: item.status,
          created_at: item.created_at,
          messages: [],
        };
      }

      groups[item.id].messages.push(item);

      return groups;
    }, {})
  );

  // ============================================================
  // OPEN REPLY DIALOG
  // ============================================================

  const openReplyDialog = (clarification) => {
    setSelectedClarification(clarification);
    setReplyMessage("");
    setVisibility("PRIVATE");
    setReplyOpen(true);
  };

  // ============================================================
  // SEND REPLY
  // ============================================================

  const handleReply = async () => {
    if (!selectedClarification || !replyMessage.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      await respondToClarification(
        token,
        selectedClarification.id,
        replyMessage.trim(),
        visibility
      );

      setReplyOpen(false);
      setReplyMessage("");

      await loadClarifications();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // SEND ANNOUNCEMENT
  // ============================================================

  const handleAnnouncement = async () => {
    if (!announcementMessage.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      await createAnnouncement(
        token,
        CONTEST_ID,
        announcementMessage.trim()
      );

      setAnnouncementMessage("");
      setAnnouncementOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#EEEEEE",
          minHeight: "83vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div
      style={{
        backgroundColor: "#EEEEEE",
        minHeight: "83vh",
        padding: "2rem",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto 2rem auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >

        <div>
          <Typography
            variant="h4"
            style={{
              color: "#0F044C",
              fontWeight: "bold",
            }}
          >
            Clarifications
          </Typography>

          <Typography
            style={{
              color: "#787A91",
              marginTop: "0.4rem",
            }}
          >
            Manage team questions, responses, and contest
            announcements.
          </Typography>
        </div>

        <Button
          variant="contained"
          onClick={() => setAnnouncementOpen(true)}
          style={{
            backgroundColor: "#141E61",
            color: "white",
            fontWeight: "bold",
            textTransform: "none",
            padding: "0.7rem 1.3rem",
            borderRadius: "8px",
          }}
        >
          📢 New Announcement
        </Button>

      </div>


      {/* ERROR */}

      {error && (
        <Typography
          color="error"
          style={{
            maxWidth: "1100px",
            margin: "0 auto 1rem auto",
          }}
        >
          {error}
        </Typography>
      )}


      {/* =====================================================
          CLARIFICATION CARDS
      ===================================================== */}

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >

        {groupedClarifications.length === 0 ? (

          <Paper
            style={{
              padding: "3rem",
              textAlign: "center",
              borderRadius: "12px",
            }}
          >
            <Typography
              variant="h6"
              style={{
                color: "#141E61",
                fontWeight: "bold",
              }}
            >
              No Clarifications
            </Typography>

            <Typography
              style={{
                color: "#787A91",
                marginTop: "0.5rem",
              }}
            >
              No teams have submitted clarification
              requests yet.
            </Typography>
          </Paper>

        ) : (

          groupedClarifications.map((clarification) => (

            <Paper
              key={clarification.id}
              style={{
                padding: "1.5rem",
                borderRadius: "12px",
                boxShadow:
                  "0 6px 20px rgba(120,122,145,0.25)",
                borderLeft:
                  clarification.status === "ANSWERED"
                    ? "5px solid #00A300"
                    : "5px solid #F0A500",
              }}
            >

              {/* CARD HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >

                <div>

                  <Typography
                    variant="h6"
                    style={{
                      color: "#141E61",
                      fontWeight: "bold",
                    }}
                  >
                    Problem {clarification.problem_id}
                  </Typography>

                  <Typography
                    variant="body2"
                    style={{
                      color: "#787A91",
                      marginTop: "0.25rem",
                    }}
                  >
                    Team: {clarification.team_name}
                  </Typography>

                </div>

                <Chip
                  label={clarification.status}
                  style={{
                    backgroundColor:
                      clarification.status === "ANSWERED"
                        ? "#E8F5E9"
                        : "#FFF4D6",

                    color:
                      clarification.status === "ANSWERED"
                        ? "#00A300"
                        : "#B26A00",

                    fontWeight: "bold",
                  }}
                />

              </div>


              <Divider
                style={{
                  marginBottom: "1rem",
                }}
              />


              {/* MESSAGES */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >

                {clarification.messages.map((message) => {

                  const isAdmin =
                    message.message_admin_id !== null;

                  return (

                    <div
                      key={message.message_id}
                      style={{
                        backgroundColor: isAdmin
                          ? "#F4F5FB"
                          : "#F8F8F8",

                        padding: "1rem",
                        borderRadius: "8px",

                        borderLeft: isAdmin
                          ? "3px solid #141E61"
                          : "3px solid #787A91",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          marginBottom: "0.4rem",
                        }}
                      >

                        <Typography
                          variant="body2"
                          style={{
                            fontWeight: "bold",
                            color: "#141E61",
                          }}
                        >
                          {isAdmin
                            ? "Administrator"
                            : clarification.team_name}
                        </Typography>

                        {isAdmin && (
                          <Chip
                            label={message.visibility}
                            size="small"
                            style={{
                              fontSize: "0.7rem",
                              backgroundColor:
                                message.visibility ===
                                "PUBLIC"
                                  ? "#E8EAF6"
                                  : "#EEEEEE",
                              color: "#141E61",
                              fontWeight: "bold",
                            }}
                          />
                        )}

                      </div>

                      <Typography
                        style={{
                          color: "#333333",
                          lineHeight: "1.5",
                        }}
                      >
                        {message.message}
                      </Typography>

                      <Typography
                        variant="caption"
                        style={{
                          color: "#787A91",
                          display: "block",
                          marginTop: "0.5rem",
                        }}
                      >
                        {new Date(
                          message.message_created_at
                        ).toLocaleString()}
                      </Typography>

                    </div>

                  );
                })}

              </div>


              {/* REPLY BUTTON */}

              <div
                style={{
                  marginTop: "1.25rem",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >

                <Button
                  variant="contained"
                  onClick={() =>
                    openReplyDialog(clarification)
                  }
                  style={{
                    backgroundColor: "#141E61",
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: "7px",
                  }}
                >
                  💬 Reply
                </Button>

              </div>

            </Paper>

          ))

        )}

      </div>


      {/* =====================================================
          REPLY DIALOG
      ===================================================== */}

      <Dialog
        open={replyOpen}
        onClose={() => {
          if (!submitting) {
            setReplyOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          style={{
            color: "#0F044C",
            fontWeight: "bold",
          }}
        >
          Reply to Clarification
        </DialogTitle>

        <DialogContent>

          {selectedClarification && (

            <>

              <Typography
                style={{
                  color: "#141E61",
                  fontWeight: "bold",
                }}
              >
                Team: {selectedClarification.team_name}
              </Typography>

              <Typography
                style={{
                  color: "#787A91",
                  marginBottom: "1rem",
                }}
              >
                Problem {selectedClarification.problem_id}
              </Typography>

            </>
          )}


          <TextField
            select
            fullWidth
            label="Reply Visibility"
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value)
            }
            margin="normal"
          >

            <MenuItem value="PRIVATE">
              Private — only this team
            </MenuItem>

            <MenuItem value="PUBLIC">
              Public — all teams
            </MenuItem>

          </TextField>


          <TextField
            fullWidth
            multiline
            minRows={5}
            label="Your response"
            placeholder="Write your response..."
            value={replyMessage}
            onChange={(e) =>
              setReplyMessage(e.target.value)
            }
            margin="normal"
          />

        </DialogContent>


        <DialogActions
          style={{
            padding: "1rem 1.5rem",
          }}
        >

          <Button
            onClick={() => setReplyOpen(false)}
            disabled={submitting}
            style={{
              color: "#787A91",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleReply}
            disabled={
              submitting ||
              !replyMessage.trim()
            }
            style={{
              backgroundColor: "#141E61",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {submitting
              ? "Sending..."
              : "Send Reply"}
          </Button>

        </DialogActions>

      </Dialog>


      {/* =====================================================
          ANNOUNCEMENT DIALOG
      ===================================================== */}

      <Dialog
        open={announcementOpen}
        onClose={() => {
          if (!submitting) {
            setAnnouncementOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle
          style={{
            color: "#0F044C",
            fontWeight: "bold",
          }}
        >
          New Contest Announcement
        </DialogTitle>

        <DialogContent>

          <Typography
            style={{
              color: "#787A91",
              marginBottom: "1rem",
            }}
          >
            This message will be visible to all teams
            participating in the contest.
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={5}
            label="Announcement"
            placeholder="Write your announcement..."
            value={announcementMessage}
            onChange={(e) =>
              setAnnouncementMessage(e.target.value)
            }
            margin="normal"
          />

        </DialogContent>

        <DialogActions
          style={{
            padding: "1rem 1.5rem",
          }}
        >

          <Button
            onClick={() =>
              setAnnouncementOpen(false)
            }
            disabled={submitting}
            style={{
              color: "#787A91",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleAnnouncement}
            disabled={
              submitting ||
              !announcementMessage.trim()
            }
            style={{
              backgroundColor: "#141E61",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {submitting
              ? "Sending..."
              : "Send Announcement"}
          </Button>

        </DialogActions>

      </Dialog>

    </div>
  );
};
