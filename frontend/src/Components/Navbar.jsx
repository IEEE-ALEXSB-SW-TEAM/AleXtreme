import { Link, useLocation, useSearchParams } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt"; // Problems
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"; // Submissions
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // Leaderboard
import LogoutIcon from "@mui/icons-material/Logout"; // Logout
import DashboardIcon from "@mui/icons-material/Dashboard"; // Admin Dashboard
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"; // Admin
import "../style/Navbar.css";
import logo from "../logo.png";
import alextremeLogo from "../AleXtreme .png";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CONTEST_ID } from "../config/config";

const Navbar = () => {
  const { isLoggedIn, userRole } = useContext(AuthContext);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const path = location.pathname;

  const isHomePage = path === "/";
  const isAboutPage = path === "/About";
  const isAdminPage = path.startsWith("/admin");

  // Helper function to preserve query params
  const getLinkWithParams = (to) => {
    let params = searchParams.toString();
    
    // For admin routes, ensure contestId is set (default to 1 if not present)
    if (to.startsWith('/admin') && !params.includes('contestId')) {
      const contestId = searchParams.get('contestId') || '1';
      params = params ? `${params}&contestId=${contestId}` : `contestId=${contestId}`;
    }
    
    return params ? `${to}?${params}` : to;
  };

  return (
    <div className="navbar-wrapper">
      <div className="nav-content">
        <div className="nav-left">
          <img src={logo} alt="IEEE AlexSB Logo" className="logo-image" />
        </div>

        <div className="nav-title">
          <img
            src={alextremeLogo}
            alt="ALexTreme Logo"
            className="title-image"
          />
        </div>

        <div className="nav-links">
          {isLoggedIn && userRole === 'admin' ? (
            <>
              <Link to={getLinkWithParams("/admin/dashboard")} className="nav-link" title="Dashboard">
                <DashboardIcon className="nav-icon" />
              </Link>
              <Link to={getLinkWithParams("/admin/leaderboard")} className="nav-link" title="Leaderboard">
                <EmojiEventsIcon className="nav-icon" />
              </Link>
              <Link to={getLinkWithParams("/admin/submissions")} className="nav-link" title="Submissions">
                <AssignmentTurnedInIcon className="nav-icon" />
              </Link>
              <Link to="/logout" className="nav-link" title="Logout">
                <LogoutIcon className="nav-icon" />
              </Link>
            </>
          ) : isLoggedIn && userRole === 'contestant' ? (
            <>
              <Link to="/problems" className="nav-link" title="Problems">
                <ListAltIcon className="nav-icon" />
              </Link>
              <Link to="/submissions" className="nav-link" title="Submissions">
                <AssignmentTurnedInIcon className="nav-icon" />
              </Link>
              <Link
                to={`/leaderboard/${CONTEST_ID}`}
                className="nav-link"
                title="Leaderboard"
              >
                <EmojiEventsIcon className="nav-icon" />
              </Link>
              <Link to="/logout" className="nav-link" title="Logout">
                <LogoutIcon className="nav-icon" />
              </Link>
            </>
          ) : (
            <>
              {!isAboutPage && !isAdminPage && (
                <Link to="/About" className="nav-link" title="About">
                  <InfoIcon className="nav-icon" />
                </Link>
              )}
              {!isHomePage && !isAdminPage && (
                <Link to="/" className="nav-link" title="Home">
                  <HomeIcon className="nav-icon" />
                </Link>
              )}
              {(isHomePage || isAboutPage) && (
                <Link to="/Login" className="nav-link" title="Login">
                  <LoginIcon className="nav-icon" />
                </Link>
              )}
              {isAdminPage && (
                <Link to="/admin/login" className="nav-link" title="Admin Login">
                  <AdminPanelSettingsIcon className="nav-icon" />
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
