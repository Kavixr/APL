import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
};

export const tournamentAPI = {
  getAllTournaments: () => api.get("/tournaments"),
  getTournament: (id) => api.get(`/tournaments/${id}`),
  createTournament: (data) => api.post("/tournaments", data),
  updateTournament: (id, data) => api.put(`/tournaments/${id}`, data),
  updateTournamentStatus: (id, status) =>
    api.put(`/tournaments/${id}/status`, status),
  deleteTournament: (id) => api.delete(`/tournaments/${id}`),
};

export const teamAPI = {
  getAllTeams: () => api.get("/teams"),
  getTeamsByTournament: (tournamentId) =>
    api.get(`/teams/tournament/${tournamentId}`),
  getMyTeams: () => api.get("/teams/my-teams"),
  createTeam: (data) => api.post("/teams", data),
  updateTeam: (id, data) => api.put(`/teams/${id}`, data),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
};

export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard-stats"),
};

export const groupAPI = {
  getGroupsByTournament: (tournamentId) =>
    api.get(`/groups/tournament/${tournamentId}`),
  assignTeamsToGroups: (data) => api.post("/groups/assign-teams", data),
  deleteGroupsByTournament: (tournamentId) =>
    api.delete(`/groups/tournament/${tournamentId}`),
};

export default api;
