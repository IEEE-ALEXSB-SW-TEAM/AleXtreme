import React, { useEffect, useState } from "react";
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

  const [initialized, setInitialized] = useState(false);

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
            setInitialized(true);
            return;
          }

          /*
            Each clarification message has a message_id.

            We keep track of the messages that existed when the
            admin first opened the website.
          */

          const currentMessageIds = clarifications.map(
            (item) => item.message_id
          );

          const storedIds = JSON.parse(
            sessionStorage.getItem("adminSeenClarificationMessages") ||
              "[]"
          );

          if (!initialized) {
            sessionStorage.setItem(
              "adminSeenClarificationMessages",
              JSON.stringify(currentMessageIds)
            );

            setInitialized(true);
            return;
          }

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

            sessionStorage.setItem(
              "adminSeenClarificationMessages",
              JSON.stringify(currentMessageIds)
            );
          }

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
              (item) =>
                `${item.message_id}-${item.created_at}`
            ),

          announcements: currentData.announcements.map(
            (item) =>
              `${item.id}-${item.created_at}`
          ),
        };

        const storedData = JSON.parse(
          sessionStorage.getItem("contestantNotificationData") ||
            "null"
        );

        // ============================================================
        // FIRST LOAD
        // ============================================================

        if (!initialized || !storedData) {
          sessionStorage.setItem(
            "contestantNotificationData",
            JSON.stringify(currentIds)
          );

          setInitialized(true);
          return;
        }

        // ============================================================
        // CHECK ANNOUNCEMENTS
        // ============================================================

        const newAnnouncements =
          currentData.announcements.filter(
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

        if (
          newPublicClarifications.length > 0 &&
          !newAnnouncements.length
        ) {
          const clarification =
            newPublicClarifications[0];

          setNotification({
            title: "New Public Clarification",
            message: `There is a new public clarification for Problem ${clarification.problem_id}.`,
            isAdmin: false,
          });
        }

        // ============================================================
        // CHECK PRIVATE / TEAM CLARIFICATIONS
        // ============================================================

        const newTeamMessages =
          currentData.clarifications.filter(
            (clarification) =>
              !storedData.clarifications.includes(
                `${clarification.id}-${clarification.message_id}-${clarification.message_created_at}`
              ) &&
              clarification.message_admin_id !== null
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
      } catch (error) {
        console.error(
          "Notification check failed:",
          error
        );
      }
    };

    // Check immediately
    checkForNotifications();

    // Check every 5 seconds
    interval = setInterval(
      checkForNotifications,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, [token, adminToken, isAdmin, initialized]);

  return (
    <NotificationPopup
      notification={notification}
      onClose={() => setNotification(null)}
    />
  );
};

export default NotificationManager;