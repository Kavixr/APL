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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { tournamentAPI } from "../services/api";
import TournamentGroups from "./TournamentGroups";

const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [tournamentData, setTournamentData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    maxTeams: 16,
  });
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openGroupsDialog, setOpenGroupsDialog] = useState(false);
  const [selectedTournamentForGroups, setSelectedTournamentForGroups] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleCreate = () => {
    setEditingTournament(null);
    setTournamentData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      maxTeams: 16,
    });
    setOpenDialog(true);
  };

  const handleEdit = (tournament) => {
    setEditingTournament(tournament);
    setTournamentData({
      name: tournament.name,
      description: tournament.description || "",
      startDate: tournament.startDate.substring(0, 16),
      endDate: tournament.endDate.substring(0, 16),
      maxTeams: tournament.maxTeams,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const formattedData = {
        ...tournamentData,
        startDate: new Date(tournamentData.startDate).toISOString(),
        endDate: new Date(tournamentData.endDate).toISOString(),
      };

      if (editingTournament) {
        await tournamentAPI.updateTournament(
          editingTournament.id,
          formattedData
        );
        setSuccess("Tournament updated successfully!");
      } else {
        await tournamentAPI.createTournament(formattedData);
        setSuccess("Tournament created successfully!");
      }

      setOpenDialog(false);
      fetchTournaments();
    } catch (err) {
      setError(err.response?.data || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        await tournamentAPI.deleteTournament(id);
        setSuccess("Tournament deleted successfully!");
        fetchTournaments();
      } catch (err) {
        setError(err.response?.data || "Failed to delete tournament");
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await tournamentAPI.updateTournamentStatus(id, status);
      setSuccess("Tournament status updated successfully!");
      fetchTournaments();
    } catch (err) {
      setError(err.response?.data || "Failed to update status");
    }
  };

  const handleView = (tournament) => {
    setSelectedTournament(tournament);
    setOpenViewDialog(true);
  };

  const handleViewGroups = (tournament) => {
    setSelectedTournamentForGroups(tournament);
    setOpenGroupsDialog(true);
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">Tournament Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Create Tournament
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                    Teams
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Start Date
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}>
                    End Date
                  </TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Created By
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {tournament.name}
                        </Typography>
                        <Box
                          sx={{ display: { xs: "block", sm: "none" }, mt: 0.5 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="caption" color="textSecondary">
                              Teams: {tournament.teams?.length || 0}/
                              {tournament.maxTeams}
                            </Typography>
                            {tournament.teams?.length ===
                              tournament.maxTeams && (
                              <Chip
                                label="Ready"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: "0.6rem", height: 16 }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            by {tournament.createdBy}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{getStatusChip(tournament.status)}</TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2">
                          {tournament.teams?.length || 0}/{tournament.maxTeams}
                        </Typography>
                        {tournament.teams?.length === tournament.maxTeams && (
                          <Chip
                            label="Ready for Groups"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", lg: "table-cell" } }}
                    >
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      {tournament.createdBy}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <IconButton
                          onClick={() => handleView(tournament)}
                          color="info"
                          size="small"
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        <Button
                          onClick={() => handleViewGroups(tournament)}
                          variant="outlined"
                          color="secondary"
                          size="small"
                          sx={{
                            minWidth: "auto",
                            fontSize: "0.75rem",
                            px: 1.5,
                            py: 0.5,
                          }}
                        >
                          Manage Groups
                        </Button>
                        <IconButton
                          onClick={() => handleEdit(tournament)}
                          color="primary"
                          size="small"
                          title="Edit Tournament"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(tournament.id)}
                          color="error"
                          size="small"
                          title="Delete Tournament"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTournament ? "Edit Tournament" : "Create New Tournament"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tournament Name"
            value={tournamentData.name}
            onChange={(e) =>
              setTournamentData({ ...tournamentData, name: e.target.value })
            }
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={tournamentData.description}
            onChange={(e) =>
              setTournamentData({
                ...tournamentData,
                description: e.target.value,
              })
            }
            margin="normal"
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            label="Start Date"
            type="datetime-local"
            value={tournamentData.startDate}
            onChange={(e) =>
              setTournamentData({
                ...tournamentData,
                startDate: e.target.value,
              })
            }
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            fullWidth
            label="End Date"
            type="datetime-local"
            value={tournamentData.endDate}
            onChange={(e) =>
              setTournamentData({ ...tournamentData, endDate: e.target.value })
            }
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            fullWidth
            label="Maximum Teams"
            type="number"
            value={tournamentData.maxTeams}
            onChange={(e) =>
              setTournamentData({
                ...tournamentData,
                maxTeams: parseInt(e.target.value),
              })
            }
            margin="normal"
            inputProps={{ min: 2, max: 64 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !tournamentData.name ||
              !tournamentData.startDate ||
              !tournamentData.endDate
            }
          >
            {editingTournament ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tournament Details</DialogTitle>
        <DialogContent>
          {selectedTournament && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTournament.name}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Description:</strong>{" "}
                {selectedTournament.description || "No description"}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Status:</strong>{" "}
                {getStatusChip(selectedTournament.status)}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Teams:</strong> {selectedTournament.teams?.length || 0}/
                {selectedTournament.maxTeams}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Start Date:</strong>{" "}
                {new Date(selectedTournament.startDate).toLocaleString()}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>End Date:</strong>{" "}
                {new Date(selectedTournament.endDate).toLocaleString()}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Created By:</strong> {selectedTournament.createdBy}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Update Status
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          selectedTournament.status === status
                            ? "contained"
                            : "outlined"
                        }
                        size="small"
                        onClick={() =>
                          handleStatusUpdate(selectedTournament.id, status)
                        }
                        disabled={selectedTournament.status === status}
                      >
                        {status}
                      </Button>
                    )
                  )}
                </Box>
              </Box>

              {selectedTournament.teams &&
                selectedTournament.teams.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Registered Teams
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Team Name</TableCell>
                          <TableCell>Created By</TableCell>
                          <TableCell>Registration Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTournament.teams.map((team) => (
                          <TableRow key={team.id}>
                            <TableCell>{team.name}</TableCell>
                            <TableCell>{team.createdBy}</TableCell>
                            <TableCell>
                              {new Date(team.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Groups Dialog */}
      <Dialog
        open={openGroupsDialog}
        onClose={() => setOpenGroupsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Tournament Groups
          {selectedTournamentForGroups &&
            ` - ${selectedTournamentForGroups.name}`}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedTournamentForGroups && (
            <TournamentGroups
              tournamentId={selectedTournamentForGroups.id}
              onClose={() => setOpenGroupsDialog(false)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TournamentManagement;
