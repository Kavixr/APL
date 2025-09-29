package com.example.demo.service;

import com.example.demo.entity.Team;
import com.example.demo.entity.Tournament;
import com.example.demo.entity.User;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.TournamentRepository;
import com.example.demo.dto.TeamRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TeamService {
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private TournamentRepository tournamentRepository;
    
    public Team createTeam(TeamRequest request, User createdBy) {
        // Ensure only regular users (not admins) can create teams
        if (createdBy.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Administrators cannot create teams. Only regular users can create teams.");
        }
        
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        
        // Check if tournament is full
        if (tournament.getTeams().size() >= tournament.getMaxTeams()) {
            throw new RuntimeException("Tournament is full");
        }
        
        // Check if team name already exists in tournament
        if (teamRepository.existsByNameAndTournament(request.getName(), tournament)) {
            throw new RuntimeException("Team name already exists in this tournament");
        }
        
        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setTournament(tournament);
        team.setCreatedBy(createdBy);
        team.setCreatedAt(LocalDateTime.now());
        
        return teamRepository.save(team);
    }
    
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
    
    public List<Team> getTeamsByTournament(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        return teamRepository.findByTournament(tournament);
    }
    
    public List<Team> getTeamsByUser(User user) {
        return teamRepository.findByCreatedBy(user);
    }
    
    public Team getTeamById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
    }
    
    public Team updateTeam(Long id, TeamRequest request, User user) {
        Team team = getTeamById(id);
        
        // Only the team creator can update their own team
        // Admins cannot update teams since they can't create them
        if (!team.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You can only update teams that you created");
        }
        
        // Check if new name conflicts with existing team in tournament
        if (!team.getName().equals(request.getName()) && 
            teamRepository.existsByNameAndTournament(request.getName(), team.getTournament())) {
            throw new RuntimeException("Team name already exists in this tournament");
        }
        
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        
        return teamRepository.save(team);
    }
    
    public void deleteTeam(Long id, User user) {
        Team team = getTeamById(id);
        
        // Only the team creator can delete their own team
        // Admins cannot delete teams since they don't create them
        if (!team.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete teams that you created");
        }
        
        teamRepository.delete(team);
    }
}