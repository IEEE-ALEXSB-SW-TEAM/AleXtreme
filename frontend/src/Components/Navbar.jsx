import { Link, useLocation } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import "../style/Navbar.css";
import logo from "../logo.png";
import alextremeLogo from "../AleXtreme .png";
import { CONTEST_ID } from "../config/config";
import { useContext } from "react";
import { AuthContext } from "../context/ContextCreation";

const Navbar = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();
  const path = location.pathname;

  const isHomePage = path === "/";
  const isAboutPage = path === "/About";

  const adminToken = localStorage.getItem("adminToken");
  const isAdmin = !!adminToken;

  return (
    <div className="navbar-wrapper">
      <div className="nav-content">

        {/* LEFT LOGO */}
        <div className="nav-left">
          <img
            src={logo}
            alt="IEEE AlexSB Logo"
            className="logo-image"
          />
        </div>

        {/* CENTER LOGO */}
        <div className="nav-title">
          <img
            src={alextremeLogo}
            alt="ALexTreme Logo"
            className="title-image"
          />
        </div>

        {/* NAVIGATION */}
        <div className="nav-links">

          {/* =====================================================
              ADMIN NAVBAR
          ===================================================== */}

          {isAdmin ? (
            <>
              {/* Admin Dashboard / Home */}
              <Link
                to="/admin/dashboard"
                className="nav-link"
                title="Admin Dashboard"
              >
                <HomeIcon className="nav-icon" />
              </Link>

              {/* Admin Clarifications */}
              <Link
                to="/admin/clarifications"
                className="nav-link"
                title="Clarifications"
              >
                <ChatBubbleOutlineIcon className="nav-icon" />
              </Link>

              {/* Admin Logout */}
              <Link
                to="/admin/login"
                className="nav-link"
                title="Logout"
                onClick={() => {
                  localStorage.removeItem("adminToken");
                }}
              >
                <LogoutIcon className="nav-icon" />
              </Link>
            </>
          ) : isLoggedIn ? (

            /* =====================================================
               CONTESTANT NAVBAR
            ===================================================== */

            <>
              {/* Problems */}
              <Link
                to="/problems"
                className="nav-link"
                title="Problems"
              >
                <ListAltIcon className="nav-icon" />
              </Link>

              {/* Submissions */}
              <Link
                to="/submissions"
                className="nav-link"
                title="Submissions"
              >
                <AssignmentTurnedInIcon className="nav-icon" />
              </Link>

              {/* Leaderboard */}
              <Link
                to={`/leaderboard/${CONTEST_ID}`}
                className="nav-link"
                title="Leaderboard"
              >
                <EmojiEventsIcon className="nav-icon" />
              </Link>

              {/* Clarifications */}
              <Link
                to="/clarifications"
                className="nav-link"
                title="Clarifications"
              >
                <ChatBubbleOutlineIcon className="nav-icon" />
              </Link>

              {/* Logout */}
              <Link
                to="/logout"
                className="nav-link"
                title="Logout"
              >
                <LogoutIcon className="nav-icon" />
              </Link>
            </>

          ) : (

            /* =====================================================
               PUBLIC NAVBAR
            ===================================================== */

            <>
              {/* About */}
              {!isAboutPage && (
                <Link
                  to="/About"
                  className="nav-link"
                  title="About"
                >
                  <InfoIcon className="nav-icon" />
                </Link>
              )}

              {/* Home */}
              {!isHomePage && (
                <Link
                  to="/"
                  className="nav-link"
                  title="Home"
                >
                  <HomeIcon className="nav-icon" />
                </Link>
              )}

              {/* Login */}
              {(isHomePage || isAboutPage) && (
                <Link
                  to="/Login"
                  className="nav-link"
                  title="Login"
                >
                  <LoginIcon className="nav-icon" />
                </Link>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Navbar;