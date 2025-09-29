import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu as MenuIcon, AccountCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo2.png";

const Navigation = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setUserMenuAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuClick = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        width: "100%",
        flexShrink: 0,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          width: "100%",
          px: { xs: 2, sm: 3, md: 4 },
          margin: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            cursor: "pointer",
          }}
          onClick={() => navigate(isAuthenticated() ? (isAdmin() ? "/admin/tournaments" : "/dashboard") : "/login")}
        >
          <Box
            component="img"
            src={logo}
            alt="Tournament Manager Logo"
            sx={{
              height: { xs: 32, sm: 40 },
              width: "auto",
              mr: { xs: 1, sm: 2 },
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              display: { xs: "none", sm: "block" },
            }}
          >
            Tournament Manager
          </Typography>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: "1rem",
              display: { xs: "block", sm: "none" },
            }}
          >
            TM
          </Typography>
        </Box>

        {isAuthenticated() && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenuClick}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
                <IconButton color="inherit" onClick={handleUserMenuClick}>
                  <AccountCircle />
                </IconButton>
              </>
            ) : (
              <>
                {isAdmin() && (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => navigate("/admin/tournaments")}
                    >
                      Tournaments
                    </Button>

                    <Button color="inherit" onClick={() => navigate("/admin")}>
                      Flipcoin
                    </Button>
                    
                  </>
                )}

                {!isAdmin() && (
                  <>
                    <Button
                      color="inherit"
                      onClick={() => navigate("/dashboard")}
                    >
                      Dashboard
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => navigate("/tournaments")}
                    >
                      View Tournaments
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => navigate("/my-teams")}
                    >
                      My Teams
                    </Button>
                  </>
                )}

                {/* <Typography
                  variant="body2"
                  sx={{ mr: 2, display: { xs: "none", sm: "block" } }}
                >
                  {user?.username}
                </Typography> */}

                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {isAdmin()
                ? [
                  <MenuItem
                      key="tournaments"
                      onClick={() => handleNavigation("/admin/tournaments")}
                    >
                      Tournaments
                    </MenuItem>,

                    <MenuItem
                      key="admin"
                      onClick={() => handleNavigation("/admin")}
                    >
                      flipcoin
                    </MenuItem>,
                  ]
                : [
                    <MenuItem
                      key="dashboard"
                      onClick={() => handleNavigation("/dashboard")}
                    >
                      Dashboard
                    </MenuItem>,
                    <MenuItem
                      key="tournaments"
                      onClick={() => handleNavigation("/tournaments")}
                    >
                      View Tournaments
                    </MenuItem>,
                    <MenuItem
                      key="teams"
                      onClick={() => handleNavigation("/my-teams")}
                    >
                      My Teams
                    </MenuItem>,
                  ]}
            </Menu>

            {/* User Menu */}
            <Menu
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
            >
              <MenuItem disabled>
                {user?.username} ({user?.role})
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
