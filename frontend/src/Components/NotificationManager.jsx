import React, { useEffect, useRef, useState } from "react";
import NotificationPopup from "./NotificationPopup";
import {
  getTeamClarifications,
  getPublicClarifications,
  getAnnouncements,
  getAllClarifications,
} from "../services/clarificationService";
import { CONTEST_ID } from "../config/config";

const NotificationManager = () => {
  const [notification, setNotification] = useState(null);

  // Use a ref instead of state for the "have we baselined yet"
  // flag. State resets to false every time this component
  // remounts (e.g. on route changes, if it's not mounted at the
  // app root) — which caused the baseline to be silently
  // re-written on every remount, swallowing real notifications.
  // A ref survives re-renders but is still per-mount, so we also
  // lean on sessionStorage (which survives remounts) as the real
  // source of truth for whether a baseline already exists.
  const initializedRef = useRef(false);

  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  const isAdmin = !!adminToken;

  useEffect(() => {
    if (!token && !adminToken) {
      return;
    }

    let interval;

    const checkForNotifications = async () => {
      try {
        // ============================================================
        // ADMIN
        // ============================================================

        if (isAdmin) {
          const clarifications = await getAllClarifications(adminToken);

          if (!clarifications || clarifications.length === 0) {
            initializedRef.current = true;
            return;
          }

          const currentMessageIds = clarifications.map(
            (item) => item.message_id
          );

          const storedIdsRaw = sessionStorage.getItem(
            "adminSeenClarificationMessages"
          );

          // Baseline only if we've never stored anything before.
          // (Not tied to initializedRef, so a remount doesn't
          // wipe out a legitimate existing baseline.)
          if (storedIdsRaw === null) {
            sessionStorage.setItem(
              "adminSeenClarificationMessages",
              JSON.stringify(currentMessageIds)
            );
            initializedRef.current = true;
            return;
          }

          const storedIds = JSON.parse(storedIdsRaw);

          const newMessages = clarifications.filter(
            (item) =>
              !storedIds.includes(item.message_id) &&
              item.message_admin_id === null
          );

          if (newMessages.length > 0) {
            const newMessage = newMessages[0];

            setNotification({
              title: "New Clarification",
              message: `${newMessage.team_name} has submitted a new clarification for Problem ${newMessage.problem_id}.`,
              isAdmin: true,
            });
          }

          sessionStorage.setItem(
            "adminSeenClarificationMessages",
            JSON.stringify(currentMessageIds)
          );

          initializedRef.current = true;
          return;
        }

        // ============================================================
        // CONTESTANT
        // ============================================================

        const [
          teamClarifications,
          publicClarifications,
          announcements,
        ] = await Promise.all([
          getTeamClarifications(token),
          getPublicClarifications(token, CONTEST_ID),
          getAnnouncements(token, CONTEST_ID),
        ]);

        const currentData = {
          clarifications: teamClarifications || [],
          publicClarifications: publicClarifications || [],
          announcements: announcements || [],
        };

        const currentIds = {
          clarifications: currentData.clarifications.map(
            (item) =>
              `${item.id}-${item.message_id}-${item.message_created_at}`
          ),

          publicClarifications:
            currentData.publicClarifications.map(
              (item) => `${item.message_id}-${item.created_at}`
            ),

          announcements: currentData.announcements.map(
            (item) => `${item.id}-${item.created_at}`
          ),
        };

        const storedDataRaw = sessionStorage.getItem(
          "contestantNotificationData"
        );

        // ============================================================
        // FIRST LOAD (only if no baseline exists at all — a
        // component remount alone should NOT re-trigger this,
        // otherwise real new messages get silently baselined
        // away instead of triggering a popup)
        // ============================================================

        if (storedDataRaw === null) {
          sessionStorage.setItem(
            "contestantNotificationData",
            JSON.stringify(currentIds)
          );

          initializedRef.current = true;
          return;
        }

        const storedData = JSON.parse(storedDataRaw);

        // ============================================================
        // CHECK ANNOUNCEMENTS
        // ============================================================

        const newAnnouncements = currentData.announcements.filter(
          (announcement) =>
            !storedData.announcements.includes(
              `${announcement.id}-${announcement.created_at}`
            )
        );

        if (newAnnouncements.length > 0) {
          const announcement = newAnnouncements[0];

          setNotification({
            title: "New Announcement",
            message: announcement.message,
            isAdmin: false,
          });
        }

        // ============================================================
        // CHECK PUBLIC CLARIFICATIONS
        // ============================================================

        const newPublicClarifications =
          currentData.publicClarifications.filter(
            (clarification) =>
              !storedData.publicClarifications.includes(
                `${clarification.message_id}-${clarification.created_at}`
              )
          );

        if (newPublicClarifications.length > 0 && !newAnnouncements.length) {
          const clarification = newPublicClarifications[0];

          setNotification({
            title: "New Public Clarification",
            message: `There is a new public clarification for Problem ${clarification.problem_id}.`,
            isAdmin: false,
          });
        }

        // ============================================================
        // CHECK PRIVATE / TEAM CLARIFICATIONS
        // ============================================================

        const newTeamMessages = currentData.clarifications.filter(
          (clarification) =>
            !storedData.clarifications.includes(
              `${clarification.id}-${clarification.message_id}-${clarification.message_created_at}`
            ) && clarification.message_admin_id !== null
        );

        if (
          newTeamMessages.length > 0 &&
          !newAnnouncements.length &&
          !newPublicClarifications.length
        ) {
          const reply = newTeamMessages[0];

          setNotification({
            title: "New Reply",
            message: `An administrator has replied to your clarification for Problem ${reply.problem_id}.`,
            isAdmin: false,
          });
        }

        // ============================================================
        // UPDATE STORED DATA
        // ============================================================

        sessionStorage.setItem(
          "contestantNotificationData",
          JSON.stringify(currentIds)
        );

        initializedRef.current = true;
      } catch (error) {
        console.error("Notification check failed:", error);
      }
    };

    // Check immediately
    checkForNotifications();

    // Check every 5 seconds
    interval = setInterval(checkForNotifications, 5000);

    return () => {
      clearInterval(interval);
    };
    // Intentionally NOT depending on an "initialized" flag —
    // that was tearing down and rebuilding the interval (and
    // resetting the baseline logic) on every state change.
  }, [token, adminToken, isAdmin]);

  return (
    <NotificationPopup
      notification={notification}
      onClose={() => setNotification(null)}
    />
  );
};

export default NotificationManager;