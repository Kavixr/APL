import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { tournamentAPI, teamAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentTeams, setTournamentTeams] = useState([]);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentAPI.getAllTournaments();
      setTournaments(response.data);
    } catch (err) {
      setError("Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTournament = async (tournament) => {
    try {
      setSelectedTournament(tournament);
      const response = await teamAPI.getTeamsByTournament(tournament.id);
      setTournamentTeams(response.data);
      setOpenViewDialog(true);
    } catch (err) {
      setError("Failed to load tournament details");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "UPCOMING":
        return "#1976d2";
      case "ONGOING":
        return "#2e7d32";
      case "COMPLETED":
        return "#757575";
      case "CANCELLED":
        return "#d32f2f";
      default:
        return "#757575";
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

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
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}
      >
        All Tournaments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tournament Cards for Mobile/Tablet */}
      <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
        <Grid container spacing={2}>
          {tournaments.map((tournament) => (
            <Grid item xs={12} sm={6} key={tournament.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      {tournament.name}
                    </Typography>
                    {getStatusChip(tournament.status)}
                  </Box>

                  <Typography color="text.secondary" gutterBottom>
                    {tournament.description}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Teams:</strong> {tournament.teams?.length || 0}/
                    {tournament.maxTeams}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Start:</strong>{" "}
                    {new Date(tournament.startDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Created by:</strong> {tournament.createdBy}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewTournament(tournament)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tournament Table for Desktop */}
      <Card sx={{ display: { xs: "none", md: "block" } }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Tournament Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Teams</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Start Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created By</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {tournament.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tournament.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(tournament.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {tournament.teams?.length || 0}/{tournament.maxTeams}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{tournament.createdBy}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewTournament(tournament)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* View Tournament Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTournament?.name} - Tournament Details
        </DialogTitle>
        <DialogContent>
          {selectedTournament && (
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Tournament Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Description:</strong>{" "}
                        <Typography component="span" color="text.secondary">
                          {selectedTournament.description ||
                            "No description provided"}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Status:</strong>{" "}
                        {getStatusChip(selectedTournament.status)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Teams:</strong>{" "}
                        <Typography component="span" color="primary">
                          {tournamentTeams.length}/{selectedTournament.maxTeams}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Start Date:</strong>{" "}
                        <Typography component="span" color="text.secondary">
                          {new Date(
                            selectedTournament.startDate
                          ).toLocaleString()}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>End Date:</strong>{" "}
                        <Typography component="span" color="text.secondary">
                          {new Date(
                            selectedTournament.endDate
                          ).toLocaleString()}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Created By:</strong>{" "}
                        <Typography component="span" color="text.secondary">
                          {selectedTournament.createdBy}
                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Created At:</strong>{" "}
                        <Typography component="span" color="text.secondary">
                          {new Date(
                            selectedTournament.createdAt
                          ).toLocaleString()}
                        </Typography>
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Registered Teams ({tournamentTeams.length})
                  </Typography>
                  {tournamentTeams.length > 0 ? (
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <strong>Team Name</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Description</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Group</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Created By</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tournamentTeams.map((team) => (
                            <TableRow key={team.id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {team.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {team.description || "No description"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {team.groupName ? (
                                  <Chip
                                    label={team.groupName}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    No group
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {team.createdBy}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 3 }}>
                      <Typography color="text.secondary" variant="body1">
                        No teams registered yet.
                      </Typography>
                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ mt: 1 }}
                      >
                        Teams will appear here once they register for this
                        tournament.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentList;
