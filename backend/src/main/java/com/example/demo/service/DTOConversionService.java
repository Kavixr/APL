package com.example.demo.service;

import com.example.demo.dto.GroupDTO;
import com.example.demo.dto.GroupBasicDTO;
import com.example.demo.dto.TeamDTO;
import com.example.demo.dto.TournamentBasicDTO;
import com.example.demo.dto.TournamentDTO;
import com.example.demo.entity.Group;
import com.example.demo.entity.Team;
import com.example.demo.entity.Tournament;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DTOConversionService {
    
    public TournamentDTO convertToTournamentDTO(Tournament tournament) {
        TournamentDTO dto = new TournamentDTO();
        dto.setId(tournament.getId());
        dto.setName(tournament.getName());
        dto.setDescription(tournament.getDescription());
        dto.setStartDate(tournament.getStartDate());
        dto.setEndDate(tournament.getEndDate());
        dto.setMaxTeams(tournament.getMaxTeams());
        dto.setStatus(tournament.getStatus().name());
        dto.setCreatedBy(tournament.getCreatedBy().getUsername());
        dto.setCreatedAt(tournament.getCreatedAt());
        
        // Convert teams to DTOs to avoid circular references
        List<TeamDTO> teamDTOs = tournament.getTeams().stream()
            .map(this::convertToTeamDTO)
            .collect(Collectors.toList());
        dto.setTeams(teamDTOs);
        
        return dto;
    }
    
    public TournamentBasicDTO convertToTournamentBasicDTO(Tournament tournament) {
        TournamentBasicDTO dto = new TournamentBasicDTO();
        dto.setId(tournament.getId());
        dto.setName(tournament.getName());
        dto.setDescription(tournament.getDescription());
        dto.setStartDate(tournament.getStartDate());
        dto.setEndDate(tournament.getEndDate());
        dto.setMaxTeams(tournament.getMaxTeams());
        dto.setStatus(tournament.getStatus().name());
        dto.setCreatedBy(tournament.getCreatedBy().getUsername());
        dto.setCreatedAt(tournament.getCreatedAt());
        return dto;
    }
    
    public TeamDTO convertToTeamDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setCreatedBy(team.getCreatedBy().getUsername());
        dto.setCreatedAt(team.getCreatedAt());
        
        // Convert tournament to basic DTO to avoid circular references
        dto.setTournament(convertToTournamentBasicDTO(team.getTournament()));
        
        // Add group information if team is assigned to a group
        if (team.getGroup() != null) {
            dto.setGroupId(team.getGroup().getId());
            dto.setGroupName(team.getGroup().getName());
        }
        
        return dto;
    }
    
    public GroupDTO convertToGroupDTO(Group group) {
        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setTournamentId(group.getTournament().getId());
        dto.setTournamentName(group.getTournament().getName());
        dto.setCreatedAt(group.getCreatedAt());
        
        // Convert teams to DTOs without group information to avoid circular reference
        List<TeamDTO> teamDTOs = group.getTeams().stream()
            .map(this::convertToTeamDTOForGroup)
            .collect(Collectors.toList());
        dto.setTeams(teamDTOs);
        
        return dto;
    }
    
    // Helper method to convert team without group info to avoid circular reference
    private TeamDTO convertToTeamDTOForGroup(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setCreatedBy(team.getCreatedBy().getUsername());
        dto.setCreatedAt(team.getCreatedAt());
        
        // Convert tournament to basic DTO
        dto.setTournament(convertToTournamentBasicDTO(team.getTournament()));
        
        // Don't include group information here to avoid circular reference
        return dto;
    }
    
    public GroupBasicDTO convertToGroupBasicDTO(Group group) {
        GroupBasicDTO dto = new GroupBasicDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setTeamCount(group.getTeams().size());
        return dto;
    }
}