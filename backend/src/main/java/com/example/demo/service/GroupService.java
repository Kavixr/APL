package com.example.demo.service;

import com.example.demo.dto.AssignTeamsToGroupRequest;
import com.example.demo.entity.Group;
import com.example.demo.entity.Team;
import com.example.demo.entity.Tournament;
import com.example.demo.entity.User;
import com.example.demo.repository.GroupRepository;
import com.example.demo.repository.TeamRepository;
import com.example.demo.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class GroupService {
    
    @Autowired
    private GroupRepository groupRepository;
    
    @Autowired
    private TournamentRepository tournamentRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    public List<Group> getGroupsByTournamentId(Long tournamentId) {
        return groupRepository.findByTournamentId(tournamentId);
    }
    
    @Transactional
    public List<Group> assignTeamsToGroupsRandomly(AssignTeamsToGroupRequest request, User admin) {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
            .orElseThrow(() -> new RuntimeException("Tournament not found"));
            
        // Check if user is admin
        if (!admin.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Only administrators can assign teams to groups");
        }
        
        // Check if tournament is full (has reached maxTeams)
        List<Team> teams = teamRepository.findByTournament(tournament);
        if (teams.size() < tournament.getMaxTeams()) {
            throw new RuntimeException("Tournament is not full yet. Current teams: " + teams.size() + ", Max teams: " + tournament.getMaxTeams());
        }
        
        // Check if groups already exist for this tournament
        List<Group> existingGroups = groupRepository.findByTournamentId(request.getTournamentId());
        if (!existingGroups.isEmpty()) {
            throw new RuntimeException("Groups have already been created for this tournament");
        }
        
        // Validate number of groups
        if (request.getNumberOfGroups() < 2 || request.getNumberOfGroups() > teams.size()) {
            throw new RuntimeException("Number of groups must be between 2 and " + teams.size());
        }
        
        // Create groups
        List<Group> groups = new ArrayList<>();
        for (int i = 1; i <= request.getNumberOfGroups(); i++) {
            Group group = new Group();
            group.setName("Group "+String.valueOf((char)('A' + i - 1)));
            group.setTournament(tournament);
            groups.add(groupRepository.save(group));
        }
        
        // Shuffle teams randomly
        List<Team> shuffledTeams = new ArrayList<>(teams);
        Collections.shuffle(shuffledTeams);
        
        // Assign teams to groups in round-robin fashion
        for (int i = 0; i < shuffledTeams.size(); i++) {
            Team team = shuffledTeams.get(i);
            Group group = groups.get(i % request.getNumberOfGroups());
            team.setGroup(group);
            teamRepository.save(team);
        }
        
        return groups;
    }
    
    @Transactional
    public void deleteGroupsByTournamentId(Long tournamentId) {
        // Validate tournament exists
        if (!tournamentRepository.existsById(tournamentId)) {
            throw new RuntimeException("Tournament not found");
        }
            
        // First, remove all group associations from teams in this tournament
        teamRepository.clearGroupAssignmentsByTournamentId(tournamentId);
        
        // Then delete all groups for this tournament
        groupRepository.deleteByTournamentId(tournamentId);
    }
}
