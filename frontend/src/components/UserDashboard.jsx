import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Groups as GroupIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { tournamentAPI, teamAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TournamentList from "./TournamentList";

const UserDashboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [teamData, setTeamData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tournamentsRes, teamsRes] = await Promise.all([
        tournamentAPI.getAllTournaments(),
        teamAPI.getMyTeams(),
      ]);

      setTournaments(tournamentsRes.data);
      setMyTeams(teamsRes.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreate = async () => {
    try {
      const teamRequest = {
        ...teamData,
        tournamentId: selectedTournament,
      };

      if (editingTeam) {
        await teamAPI.updateTeam(editingTeam.id, teamRequest);
        setSuccess("Team updated successfully!");
      } else {
        await teamAPI.createTeam(teamRequest);
        setSuccess("Team created successfully!");
      }

      setOpenTeamDialog(false);
      setEditingTeam(null);
      setTeamData({ name: "", description: "" });
      setSelectedTournament("");
      fetchData();
    } catch (err) {
      setError(
        err.response?.data ||
          `Failed to ${editingTeam ? "update" : "create"} team`
      );
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamData({
      name: team.name,
      description: team.description || "",
    });
    setSelectedTournament(team.tournament.id);
    setOpenTeamDialog(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await teamAPI.deleteTeam(teamId);
        setSuccess("Team deleted successfully!");
        fetchData();
      } catch (err) {
        setError(err.response?.data || "Failed to delete team");
      }
    }
  };

  const getStatusChip = (status) => {
    const statusColors = {
      UPCOMING: "primary",
      ONGOING: "success",
      COMPLETED: "default",
      CANCELLED: "error",
    };
    return <Chip label={status} color={statusColors[status]} size="small" />;
  };

  const availableTournaments = tournaments.filter(
    (t) =>
      t.status === "UPCOMING" &&
      (!editingTeam || t.id === editingTeam.tournament.id)
  );

  // Show tournament list view for /tournaments route
  if (location.pathname === "/tournaments") {
    return <TournamentList />;
  }

  if (loading) return <Typography>Loading...</Typography>;

  // Determine title and content based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/my-teams":
        return "My Teams & Groups";
      case "/dashboard":
        return "Tournament Dashboard";
      default:
        return "My Teams Dashboard";
    }
  };

  const isTeamsPage = location.pathname === "/my-teams";
  const isDashboardPage = location.pathname === "/dashboard";

  return (
    <Container
      maxWidth={false}
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: "none !important",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        margin: 0,
      }}
    >
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
          {getPageTitle()}
        </Typography>
        {isDashboardPage && (
          <Typography variant="subtitle1" color="text.secondary">
            Track your teams, tournament progress, and group assignments in one
            place
          </Typography>
        )}
        {location.pathname === "/my-teams" && (
          <Typography variant="subtitle1" color="text.secondary">
            Manage all your teams and view their group assignments
          </Typography>
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, mx: 0 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3, mx: 0 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* Dashboard Overview Stats */}
      {isDashboardPage && (
        <Grid container spacing={3} sx={{ mb: 4, width: "100%", justifyContent: "center" }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                textAlign: "center",
                background: "linear-gradient(135deg, #032472 0%, #2c9be1 100%)",
                color: "white",
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardContent
                sx={{
                  py: 2,
                  px: 10,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:last-child": { pb: 2 },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "2rem", sm: "3rem" },
                  }}
                >
                  {myTeams.length}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  My Teams
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                textAlign: "center",
                background: "linear-gradient(135deg, #2c9be1 0%, #032472 100%)",
                color: "white",
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardContent
                sx={{
                  py: 2,
                  px: 8.9,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:last-child": { pb: 2 },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "2rem", sm: "3rem" },
                  }}
                >
                  {
                    myTeams.filter(
                      (team) => team.tournament?.status === "ONGOING"
                    ).length
                  }
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Active Teams
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                textAlign: "center",
                background: "linear-gradient(135deg, #032472 0%, #2c9be1 100%)",
                color: "white",
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardContent
                sx={{
                  py: 2,
                  px: 7.3,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:last-child": { pb: 2 },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "2rem", sm: "3rem" },
                  }}
                >
                  {myTeams.filter((team) => team.groupName).length}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Teams in Groups
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                textAlign: "center",
                background: "linear-gradient(135deg, #2c9be1 0%, #032472 100%)",
                color: "white",
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardContent
                sx={{
                  py: 2,
                  px: 9.6,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  "&:last-child": { pb: 2 },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "2rem", sm: "3rem" },
                  }}
                >
                  {
                    myTeams.filter(
                      (team) => team.tournament?.status === "COMPLETED"
                    ).length
                  }
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  Completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Group Assignments Section - Only show on dashboard */}
      {isDashboardPage && (
        <Box sx={{ mb: 4, width: "100%" }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            My Group Assignments
          </Typography>
          {myTeams.filter((team) => team.groupName).length > 0 ? (
            <Grid container spacing={2}>
              {myTeams
                .filter((team) => team.groupName)
                .map((team) => (
                  <Grid item xs={12} sm={6} md={4} key={team.id}>
                    <Card
                      sx={{
                        border: 2,
                        borderColor: "#032472",
                        background:
                          "linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%)",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <GroupIcon sx={{ mr: 1, color: "#032472" }} />
                          <Typography variant="h6" sx={{ color: "#032472" }}>
                            {team.groupName}
                          </Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="medium">
                          {team.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tournament: {team.tournament?.name}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {getStatusChip(team.tournament?.status)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          ) : (
            <Card sx={{ textAlign: "center", py: 4, background: "#f8f9fa" }}>
              <CardContent>
                <GroupIcon
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Group Assignments Yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your teams will appear here once they are assigned to
                  tournament groups.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Tournament Status Section - Only show on dashboard */}
      {isDashboardPage && (
        <Box sx={{ mb: 4, width: "100%" }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            Tournament Status
          </Typography>
          <Grid container spacing={2}>
            {tournaments
              .filter((t) =>
                myTeams.some((team) => team.tournament?.id === t.id)
              )
              .map((tournament) => {
                const myTeamsInTournament = myTeams.filter(
                  (team) => team.tournament?.id === tournament.id
                );
                const isReadyForGroups =
                  tournament.teams?.length === tournament.maxTeams;
                const hasGroups = myTeamsInTournament.some(
                  (team) => team.groupName
                );

                return (
                  <Grid item xs={12} sm={6} md={4} key={tournament.id}>
                    <Card
                      sx={{
                        border: isReadyForGroups ? 2 : 1,
                        borderColor: isReadyForGroups ? "#2c9be1" : "divider",
                        background: hasGroups
                          ? "linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%)"
                          : "white",
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 1,
                            paddingRight: "1%",
                          }}
                        >
                          <Typography variant="h6" gutterBottom>
                            {tournament.name}
                          </Typography>
                          {getStatusChip(tournament.status)}
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Teams: {tournament.teams?.length || 0}/
                          {tournament.maxTeams}
                        </Typography>

                        {isReadyForGroups && !hasGroups && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label="Ready for Group Division"
                              sx={{
                                fontWeight: "medium",
                                backgroundColor: "#2c9be1",
                                color: "white",
                              }}
                              size="small"
                            />
                          </Box>
                        )}

                        {hasGroups && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              icon={<GroupIcon />}
                              label="Groups Assigned"
                              sx={{
                                fontWeight: "medium",
                                backgroundColor: "#032472",
                                color: "white",
                              }}
                              size="small"
                            />
                          </Box>
                        )}

                        {!isReadyForGroups &&
                          tournament.status === "UPCOMING" && (
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={`Need ${
                                  tournament.maxTeams -
                                  (tournament.teams?.length || 0)
                                } more teams`}
                                color="default"
                                size="small"
                              />
                            </Box>
                          )}

                        {/* <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block" }}
                        >
                          My teams: {myTeamsInTournament.length}
                        </Typography> */}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>

          {tournaments.filter((t) =>
            myTeams.some((team) => team.tournament?.id === t.id)
          ).length === 0 && (
            <Card sx={{ textAlign: "center", py: 4, background: "#f8f9fa" }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Active Tournaments
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a team to join a tournament and see status updates
                  here.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Show My Teams heading and Create Team button only on teams page */}
      {isTeamsPage && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            width: "100%",
          }}
        >
          <Typography variant="h5">All My Teams</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenTeamDialog(true)}
            sx={{
              backgroundColor: "#032472",
              "&:hover": {
                backgroundColor: "#2c9be1",
              },
            }}
          >
            Create Team
          </Button>
        </Box>
      )}

      {/* Teams List - Only show on teams page */}
      {!isDashboardPage && myTeams.length > 0 ? (
        <Grid container spacing={3} sx={{ width: "100%", flexGrow: 1 }}>
          {myTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 3,
                    "&:last-child": { pb: 3 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      height: "100%",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {team.name}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {team.description || "No description"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tournament:</strong> {team.tournament?.name}
                      </Typography>
                      {team.groupName && (
                        <Box sx={{ mt: 1, mb: 1 }}>
                          <Chip
                            icon={<GroupIcon />}
                            label={team.groupName}
                            sx={{
                              fontWeight: "medium",
                              backgroundColor: "#032472",
                              color: "white",
                              "& .MuiChip-icon": {
                                color: "white",
                              },
                            }}
                            variant="filled"
                            size="small"
                          />
                        </Box>
                      )}
                      {!team.groupName &&
                        team.tournament?.status === "UPCOMING" && (
                          <Box sx={{ mt: 1, mb: 1 }}>
                            <Chip
                              label="Awaiting Group Assignment"
                              color="default"
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        )}
                      <Box sx={{ mt: 1 }}>
                        {getStatusChip(team.tournament?.status)}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        onClick={() => handleEditTeam(team)}
                        sx={{ color: "#032472" }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteTeam(team.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : !isDashboardPage ? (
        <Card sx={{ mt: 2, width: "100%", flexGrow: 1 }}>
          <CardContent
            sx={{
              textAlign: "center",
              py: { xs: 6, sm: 8 },
              px: { xs: 3, sm: 4 },
              "&:last-child": { pb: { xs: 6, sm: 8 } },
            }}
          >
            <GroupIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No teams created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first team to participate in tournaments
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTeamDialog(true)}
              sx={{
                backgroundColor: "#032472",
                "&:hover": {
                  backgroundColor: "#2c9be1",
                },
              }}
            >
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* View All Teams link for dashboard */}
      {/* {isDashboardPage && myTeams.length > 4 && (
        <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/my-teams")}
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              borderColor: "#032472",
              color: "#032472",
              "&:hover": {
                borderColor: "#2c9be1",
                backgroundColor: "#f0f8ff",
              },
            }}
          >
            View All Teams ({myTeams.length})
          </Button>
        </Box>
      )} */}

      {/* Team Dialog */}
      <Dialog
        open={openTeamDialog}
        onClose={() => {
          setOpenTeamDialog(false);
          setEditingTeam(null);
          setTeamData({ name: "", description: "" });
          setSelectedTournament("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTeam ? "Edit Team" : "Create New Team"}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ pt: 1, pb: 1 }}>
            <TextField
              fullWidth
              label="Team Name"
              value={teamData.name}
              onChange={(e) =>
                setTeamData({ ...teamData, name: e.target.value })
              }
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Team Description"
              value={teamData.description}
              onChange={(e) =>
                setTeamData({ ...teamData, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth required>
              <InputLabel>Tournament</InputLabel>
              <Select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                label="Tournament"
                disabled={editingTeam !== null}
              >
                {availableTournaments.map((tournament) => (
                  <MenuItem key={tournament.id} value={tournament.id}>
                    {tournament.name} ({tournament.teams?.length || 0}/
                    {tournament.maxTeams})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {availableTournaments.length === 0 && !editingTeam && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No tournaments available for team registration at the moment.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenTeamDialog(false);
              setEditingTeam(null);
              setTeamData({ name: "", description: "" });
              setSelectedTournament("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTeamCreate}
            variant="contained"
            disabled={!teamData.name || !selectedTournament}
            sx={{
              backgroundColor: "#032472",
              "&:hover": {
                backgroundColor: "#2c9be1",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
              },
            }}
          >
            {editingTeam ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDashboard;
