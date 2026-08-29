import { useEffect, useState } from "react";
import {
  getTeamClarifications,
  getPublicClarifications,
  getAnnouncements,
} from "../services/clarificationService";

import {
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

import { CONTEST_ID } from "../config/config";
import api from "../api";

function Clarifications() {
  const [clarifications, setClarifications] = useState([]);
  const [publicClarifications, setPublicClarifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Problems belonging ONLY to the current contest
  const [problems, setProblems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [clarificationOpen, setClarificationOpen] = useState(false);

  const [problemId, setProblemId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadClarifications = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        teamClarifications,
        publicResponses,
        contestAnnouncements,
      ] = await Promise.all([
        getTeamClarifications(token),
        getPublicClarifications(token, CONTEST_ID),
        getAnnouncements(token, CONTEST_ID),
      ]);

      setClarifications(teamClarifications);
      setPublicClarifications(publicResponses);
      setAnnouncements(contestAnnouncements);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD PROBLEMS FOR CURRENT CONTEST
  // ============================================================

  const loadProblems = async () => {
    try {
      const response = await api.get(`/problems/${CONTEST_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProblems(response.data);
    } catch (err) {
      console.error("Error fetching contest problems:", err);
      setError("Failed to load contest problems.");
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!token) {
      setError("You must be logged in to view clarifications.");
      setLoading(false);
      return;
    }

    loadClarifications();
    loadProblems();
  }, []);

  // ============================================================
  // GROUP CLARIFICATIONS
  // ============================================================
  // The API returns a FLAT list of message rows (one row per
  // team/admin message). Multiple rows can share the same
  // clarification `id` (the original question + each reply).
  // We group them here so each clarification renders as ONE
  // card containing all of its messages, instead of rendering
  // one full card per row (which was causing duplicates).

  const groupedClarifications = Object.values(
    clarifications.reduce((groups, item) => {
      if (!groups[item.id]) {
        groups[item.id] = {
          id: item.id,
          contest_id: item.contest_id,
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
  // CREATE CLARIFICATION
  // ============================================================

  const handleCreateClarification = async () => {
    if (!problemId || !message.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/clarifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contest_id: CONTEST_ID,
            problem_id: problemId,
            message: message.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create clarification"
        );
      }

      setProblemId("");
      setMessage("");
      setClarificationOpen(false);

      await loadClarifications();
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
        <Typography
          style={{
            color: "#141E61",
            fontWeight: "bold",
          }}
        >
          Loading clarifications...
        </Typography>
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
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto 2rem auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
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
            Clarifications & Announcements
          </Typography>

          <Typography
            style={{
              color: "#787A91",
              marginTop: "0.4rem",
            }}
          >
            Stay updated with contest announcements, public
            clarifications, and your submitted questions.
          </Typography>
        </div>

        <Button
          variant="contained"
          onClick={() => setClarificationOpen(true)}
          style={{
            backgroundColor: "#141E61",
            color: "white",
            fontWeight: "bold",
            textTransform: "none",
            padding: "0.7rem 1.3rem",
            borderRadius: "8px",
            whiteSpace: "nowrap",
          }}
        >
          💬 Make a Clarification
        </Button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto 1.5rem auto",
          }}
        >
          <Paper
            style={{
              padding: "1rem",
              borderRadius: "10px",
              borderLeft: "4px solid #D32F2F",
            }}
          >
            <Typography color="error">
              {error}
            </Typography>
          </Paper>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* =====================================================
            ANNOUNCEMENTS
        ===================================================== */}

        <section style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "#E8EAF6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "1.3rem",
              }}
            >
              📢
            </div>

            <div>
              <Typography
                variant="h5"
                style={{
                  color: "#0F044C",
                  fontWeight: "bold",
                }}
              >
                Announcements
              </Typography>

              <Typography
                variant="body2"
                style={{
                  color: "#787A91",
                }}
              >
                Important messages from contest administrators
              </Typography>
            </div>
          </div>

          {announcements.length === 0 ? (
            <Paper
              style={{
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <Typography style={{ color: "#787A91" }}>
                No announcements yet.
              </Typography>
            </Paper>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {announcements.map((announcement) => (
                <Paper
                  key={announcement.id}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "12px",
                    boxShadow:
                      "0 6px 20px rgba(120,122,145,0.2)",
                    borderLeft: "5px solid #141E61",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <Typography
                      style={{
                        color: "#141E61",
                        fontWeight: "bold",
                      }}
                    >
                      📢 Contest Announcement
                    </Typography>

                    <Typography
                      variant="caption"
                      style={{
                        color: "#787A91",
                      }}
                    >
                      {new Date(
                        announcement.created_at
                      ).toLocaleString()}
                    </Typography>
                  </div>

                  <Typography
                    style={{
                      color: "#333333",
                      lineHeight: "1.6",
                    }}
                  >
                    {announcement.message}
                  </Typography>
                </Paper>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            PUBLIC CLARIFICATIONS
        ===================================================== */}

        <section style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "#E8EAF6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "1.3rem",
              }}
            >
              💬
            </div>

            <div>
              <Typography
                variant="h5"
                style={{
                  color: "#0F044C",
                  fontWeight: "bold",
                }}
              >
                Public Clarifications
              </Typography>

              <Typography
                variant="body2"
                style={{
                  color: "#787A91",
                }}
              >
                Questions and answers shared with all teams
              </Typography>
            </div>
          </div>

          {publicClarifications.length === 0 ? (
            <Paper
              style={{
                padding: "1.5rem",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <Typography style={{ color: "#787A91" }}>
                No public clarifications yet.
              </Typography>
            </Paper>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {publicClarifications.map((clarification) => (
                <Paper
                  key={clarification.message_id}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "12px",
                    boxShadow:
                      "0 6px 20px rgba(120,122,145,0.2)",
                    borderLeft: "5px solid #141E61",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{
                        color: "#141E61",
                        fontWeight: "bold",
                      }}
                    >
                      Problem {clarification.problem_id}
                    </Typography>

                    <Chip
                      label="PUBLIC"
                      size="small"
                      style={{
                        backgroundColor: "#E8EAF6",
                        color: "#141E61",
                        fontWeight: "bold",
                      }}
                    />
                  </div>

                  <Typography
                    style={{
                      color: "#333333",
                      lineHeight: "1.6",
                    }}
                  >
                    {clarification.message}
                  </Typography>

                  <Typography
                    variant="caption"
                    style={{
                      color: "#787A91",
                      display: "block",
                      marginTop: "0.75rem",
                    }}
                  >
                    {new Date(
                      clarification.created_at
                    ).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            MY CLARIFICATIONS
        ===================================================== */}

        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                backgroundColor: "#E8EAF6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "1.3rem",
              }}
            >
              ✉️
            </div>

            <div>
              <Typography
                variant="h5"
                style={{
                  color: "#0F044C",
                  fontWeight: "bold",
                }}
              >
                My Clarifications
              </Typography>

              <Typography
                variant="body2"
                style={{
                  color: "#787A91",
                }}
              >
                Your questions and responses from administrators
              </Typography>
            </div>
          </div>

          {groupedClarifications.length === 0 ? (
            <Paper
              style={{
                padding: "2.5rem",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow:
                  "0 6px 20px rgba(120,122,145,0.15)",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: "0.75rem",
                }}
              >
                💬
              </div>

              <Typography
                variant="h6"
                style={{
                  color: "#141E61",
                  fontWeight: "bold",
                }}
              >
                You haven't submitted any clarifications yet.
              </Typography>

              <Typography
                style={{
                  color: "#787A91",
                  marginTop: "0.5rem",
                }}
              >
                Questions you send during the contest will
                appear here.
              </Typography>
            </Paper>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {groupedClarifications.map((clarification) => (
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
                  {/* CLARIFICATION HEADER */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <Typography
                      variant="h6"
                      style={{
                        color: "#141E61",
                        fontWeight: "bold",
                      }}
                    >
                      Problem {clarification.problem_id}
                    </Typography>

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

                  <Divider style={{ marginBottom: "1.25rem" }} />

                  {/* =================================================
                      CONVERSATION
                  ================================================= */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {clarification.messages.map((messageItem) => {
                      const isAdmin =
                        messageItem.message_admin_id !== null;

                      return (
                        <div
                          key={messageItem.message_id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isAdmin
                              ? "flex-end"
                              : "flex-start",
                          }}
                        >
                          {/* MESSAGE LABEL */}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginBottom: "0.35rem",
                            }}
                          >
                            <Typography
                              variant="body2"
                              style={{
                                fontWeight: "bold",
                                color: isAdmin
                                  ? "#141E61"
                                  : "#555555",
                              }}
                            >
                              {isAdmin
                                ? "🛡️ Administrator"
                                : "👥 Your Team"}
                            </Typography>

                            {isAdmin && (
                              <Chip
                                label={
                                  messageItem.visibility
                                }
                                size="small"
                                style={{
                                  height: "22px",
                                  fontSize: "0.68rem",
                                  backgroundColor:
                                    messageItem.visibility ===
                                    "PUBLIC"
                                      ? "#E8EAF6"
                                      : "#EEEEEE",
                                  color: "#141E61",
                                  fontWeight: "bold",
                                }}
                              />
                            )}
                          </div>

                          {/* MESSAGE BUBBLE */}

                          <div
                            style={{
                              maxWidth: "75%",
                              padding: "1rem 1.2rem",
                              borderRadius: isAdmin
                                ? "14px 14px 4px 14px"
                                : "14px 14px 14px 4px",

                              backgroundColor: isAdmin
                                ? "#E8EAF6"
                                : "#F5F5F5",

                              border: isAdmin
                                ? "1px solid #C5CAE9"
                                : "1px solid #E0E0E0",

                              boxShadow:
                                "0 2px 8px rgba(0,0,0,0.06)",
                            }}
                          >
                            <Typography
                              style={{
                                color: "#333333",
                                lineHeight: "1.6",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {messageItem.message}
                            </Typography>
                          </div>

                          {/* TIMESTAMP */}

                          <Typography
                            variant="caption"
                            style={{
                              color: "#787A91",
                              marginTop: "0.3rem",
                            }}
                          >
                            {new Date(
                              messageItem.message_created_at
                            ).toLocaleString()}
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                </Paper>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          CREATE CLARIFICATION DIALOG
      ===================================================== */}

      <Dialog
        open={clarificationOpen}
        onClose={() => {
          if (!submitting) {
            setClarificationOpen(false);
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
          Make a Clarification
        </DialogTitle>

        <DialogContent>
          <Typography
            style={{
              color: "#787A91",
              marginBottom: "1rem",
            }}
          >
            Your clarification will be sent privately to
            the contest administrators.
          </Typography>

          {/* =====================================================
              CONTEST PROBLEM DROPDOWN
          ===================================================== */}

          <TextField
            select
            fullWidth
            label="Problem"
            value={problemId}
            onChange={(e) => setProblemId(e.target.value)}
            margin="normal"
          >
            {problems.map((problem) => (
              <MenuItem
                key={problem.id}
                value={problem.id}
              >
                Problem {problem.id}
                {problem.title
                  ? ` — ${problem.title}`
                  : ""}
              </MenuItem>
            ))}
          </TextField>

          {problems.length === 0 && (
            <Typography
              variant="body2"
              style={{
                color: "#787A91",
                marginTop: "0.5rem",
              }}
            >
              No problems are currently available for this
              contest.
            </Typography>
          )}

          <TextField
            fullWidth
            multiline
            minRows={5}
            label="Your clarification"
            placeholder="Write your question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            margin="normal"
          />
        </DialogContent>

        <DialogActions
          style={{
            padding: "1rem 1.5rem",
          }}
        >
          <Button
            onClick={() => setClarificationOpen(false)}
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
            onClick={handleCreateClarification}
            disabled={
              submitting ||
              !problemId ||
              !message.trim() ||
              problems.length === 0
            }
            style={{
              backgroundColor: "#141E61",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            {submitting
              ? "Sending..."
              : "Send Clarification"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Clarifications;