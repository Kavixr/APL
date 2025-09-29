import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Shuffle as ShuffleIcon,
  Groups as GroupsIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { groupAPI, tournamentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const TournamentGroups = ({ tournamentId, onClose }) => {
  const [groups, setGroups] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(2);
  const [assigning, setAssigning] = useState(false);
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchTournamentAndGroups();
  }, [tournamentId]);

  const fetchTournamentAndGroups = async () => {
    try {
      setLoading(true);

      // First fetch tournament data
      const tournamentResponse = await tournamentAPI.getTournament(
        tournamentId
      );
      setTournament(tournamentResponse.data);

      // Then try to fetch groups, but don't fail if it errors (groups might not exist yet)
      try {
        const groupsResponse = await groupAPI.getGroupsByTournament(
          tournamentId
        );
        setGroups(groupsResponse.data || []);
      } catch (groupError) {
        console.log("No groups found or error fetching groups:", groupError);
        setGroups([]); // Set empty groups if none exist
      }

      setError("");
    } catch (err) {
      console.error("Error fetching tournament data:", err);
      setError("Failed to load tournament data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeams = async () => {
    try {
      setAssigning(true);
      setError("");

      const response = await groupAPI.assignTeamsToGroups({
        tournamentId,
        numberOfGroups,
      });

      setGroups(response.data);
      setSuccess("Teams have been successfully assigned to groups!");
      setOpenAssignDialog(false);

      // Refresh tournament data to get updated team information
      const tournamentResponse = await tournamentAPI.getTournament(
        tournamentId
      );
      setTournament(tournamentResponse.data);
    } catch (err) {
      console.error("Error assigning teams:", err);
      setError(err.response?.data || "Failed to assign teams to groups");
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteGroups = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all groups? This will remove team assignments."
      )
    ) {
      return;
    }

    try {
      setError("");
      await groupAPI.deleteGroupsByTournament(tournamentId);
      setGroups([]);
      setSuccess("Groups have been deleted successfully!");

      // Refresh tournament data
      const tournamentResponse = await tournamentAPI.getTournament(
        tournamentId
      );
      setTournament(tournamentResponse.data);
    } catch (err) {
      console.error("Error deleting groups:", err);
      setError(err.response?.data || "Failed to delete groups");
    }
  };

  const canAssignTeams =
    tournament &&
    tournament.teams.length === tournament.maxTeams &&
    groups.length === 0;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <GroupsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Tournament Groups Management
        </Typography>
        {tournament && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{tournament.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Teams: {tournament.teams.length} / {tournament.maxTeams}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {tournament.status}
              </Typography>
            </CardContent>
          </Card>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {/* Main Feature Section */}
        {isAdmin && canAssignTeams && (
          <Card
            sx={{
              mb: 3,
              bgcolor: "primary.50",
              border: "2px solid",
              borderColor: "primary.200",
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <ShuffleIcon
                sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h5" color="primary.main" gutterBottom>
                Ready to Divide Teams into Groups!
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
              >
                All {tournament?.teams.length} teams have joined the tournament.
                You can now randomly divide them into groups to start the
                competition.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShuffleIcon />}
                onClick={() => setOpenAssignDialog(true)}
                sx={{ px: 4, py: 1.5, fontSize: "1.1rem" }}
              >
                Divide Teams into Groups
              </Button>
            </CardContent>
          </Card>
        )}
        {/* Secondary Actions */}
        {isAdmin && groups.length > 0 && (
          <Box sx={{ mb: 2, textAlign: "right" }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteGroups}
              size="small"
            >
              Reset Groups
            </Button>
          </Box>
        )}{" "}
        {!canAssignTeams &&
          groups.length === 0 &&
          tournament &&
          tournament.teams.length < tournament.maxTeams && (
            <Card
              sx={{
                mb: 3,
                bgcolor: "warning.50",
                border: "1px solid",
                borderColor: "warning.200",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="warning.dark" gutterBottom>
                  Waiting for More Teams
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {tournament.teams.length} / {tournament.maxTeams} teams have
                  joined
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Need {tournament.maxTeams - tournament.teams.length} more
                  teams before groups can be created
                </Typography>
              </CardContent>
            </Card>
          )}
      </Box>

      {groups.length > 0 ? (
        <Box>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ mb: 3, textAlign: "center" }}
          >
            Tournament Groups ({groups.length} Groups)
          </Typography>
          <Grid container spacing={3}>
            {groups.map((group, index) => (
              <Grid item xs={12} md={6} lg={4} key={group.id}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: "100%",
                    border: "2px solid",
                    borderColor: `hsl(${
                      (index * 360) / groups.length
                    }, 70%, 85%)`,
                    bgcolor: `hsl(${(index * 360) / groups.length}, 70%, 98%)`,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    color="primary"
                    sx={{ textAlign: "center", mb: 2 }}
                  >
                    {group.name}
                    <Chip
                      label={`${group.teams.length} teams`}
                      size="small"
                      sx={{ ml: 1 }}
                      color="primary"
                    />
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {group.teams.length > 0 ? (
                    <List dense>
                      {group.teams.map((team, teamIndex) => (
                        <ListItem
                          key={team.id}
                          sx={{
                            px: 1,
                            py: 0.5,
                            bgcolor: "rgba(255,255,255,0.7)",
                            mb: 1,
                            borderRadius: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: `hsl(${
                                  (teamIndex * 360) / group.teams.length
                                }, 60%, 60%)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 2,
                                fontSize: "12px",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              {teamIndex + 1}
                            </Box>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight="medium">
                                  {team.name}
                                </Typography>
                              }
                              secondary={
                                team.description && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {team.description.length > 30
                                      ? team.description.substring(0, 30) +
                                        "..."
                                      : team.description}
                                  </Typography>
                                )
                              }
                            />
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No teams assigned
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Box textAlign="center" py={6}>
          <GroupsIcon
            sx={{ fontSize: 80, color: "text.secondary", mb: 2, opacity: 0.5 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No groups created yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {canAssignTeams
              ? "Click the button above to divide teams into groups"
              : "Wait for all teams to join before creating groups"}
          </Typography>
        </Box>
      )}

      {/* Divide Teams Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1, bgcolor: "primary.50" }}>
          <ShuffleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Divide Teams into Groups
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 3 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Tournament: {tournament?.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Ready to randomly divide{" "}
              <strong>{tournament?.teams.length} teams</strong> into groups
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Teams will be randomly shuffled and evenly distributed across the
              selected number of groups
            </Typography>
          </Box>

          <Box sx={{ mb: 3, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ textAlign: "center", fontWeight: "bold" }}
            >
              How many groups do you want?
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Number of Groups"
              type="number"
              fullWidth
              value={numberOfGroups}
              onChange={(e) => setNumberOfGroups(parseInt(e.target.value) || 2)}
              inputProps={{
                min: 2,
                max: tournament?.teams.length || 16,
              }}
              helperText={`Choose between 2 and ${
                tournament?.teams.length || 16
              } groups`}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "white",
                },
              }}
            />

            {numberOfGroups >= 2 &&
              numberOfGroups <= (tournament?.teams.length || 16) && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "info.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "info.200",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="info.dark"
                    sx={{ fontWeight: "medium" }}
                  >
                    <strong>Preview:</strong> Each group will have approximately{" "}
                    {Math.floor(
                      (tournament?.teams.length || 0) / numberOfGroups
                    )}{" "}
                    -{" "}
                    {Math.ceil(
                      (tournament?.teams.length || 0) / numberOfGroups
                    )}{" "}
                    teams
                  </Typography>
                </Box>
              )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3, justifyContent: "center", gap: 2 }}>
          <Button
            onClick={() => setOpenAssignDialog(false)}
            disabled={assigning}
            size="large"
            sx={{ px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignTeams}
            variant="contained"
            size="large"
            disabled={
              assigning ||
              numberOfGroups < 2 ||
              numberOfGroups > (tournament?.teams.length || 16)
            }
            sx={{ px: 4 }}
          >
            {assigning ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Dividing Teams...
              </>
            ) : (
              <>
                <ShuffleIcon sx={{ mr: 1 }} />
                Divide Teams Now
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentGroups;
