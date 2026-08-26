const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ============================================================
// HELPER
// ============================================================

const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ============================================================
// TEAM
// ============================================================

// Create a clarification
export const createClarification = async (
  token,
  contestId,
  problemId,
  message
) => {
  const response = await fetch(`${API_URL}/clarifications`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      contest_id: contestId,
      problem_id: problemId,
      message,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create clarification");
  }

  return data;
};

// Get team's own clarifications
export const getTeamClarifications = async (token) => {
  const response = await fetch(`${API_URL}/clarifications`, {
    method: "GET",
    headers: getAuthHeaders(token),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to retrieve clarifications");
  }

  return data;
};

// Get one clarification
export const getTeamClarification = async (token, clarificationId) => {
  const response = await fetch(
    `${API_URL}/clarifications/${clarificationId}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to retrieve clarification");
  }

  return data;
};

// Get public clarification responses
export const getPublicClarifications = async (token, contestId) => {
  const response = await fetch(
    `${API_URL}/clarifications/public?contest_id=${contestId}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to retrieve public clarifications"
    );
  }

  return data;
};

// Get contest announcements
export const getAnnouncements = async (token, contestId) => {
  const response = await fetch(
    `${API_URL}/clarifications/announcements/list?contest_id=${contestId}`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to retrieve announcements");
  }

  return data;
};

// ============================================================
// ADMIN
// ============================================================

// Get all clarifications
export const getAllClarifications = async (token) => {
  const response = await fetch(
    `${API_URL}/clarifications/admin/all`,
    {
      method: "GET",
      headers: getAuthHeaders(token),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to retrieve all clarifications");
  }

  return data;
};

// Respond to clarification
export const respondToClarification = async (
  token,
  clarificationId,
  message,
  visibility
) => {
  const response = await fetch(
    `${API_URL}/clarifications/admin/${clarificationId}/messages`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        message,
        visibility,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to respond to clarification");
  }

  return data;
};

// Create announcement
export const createAnnouncement = async (
  token,
  contestId,
  message
) => {
  const response = await fetch(
    `${API_URL}/clarifications/admin/announcements`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        contest_id: contestId,
        message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create announcement");
  }

  return data;
};