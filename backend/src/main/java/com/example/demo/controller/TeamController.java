package com.example.demo.controller;

import com.example.demo.dto.TeamRequest;
import com.example.demo.dto.TeamDTO;
import com.example.demo.entity.Team;
import com.example.demo.entity.User;
import com.example.demo.service.TeamService;
import com.example.demo.service.UserService;
import com.example.demo.service.DTOConversionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {
    
    @Autowired
    private TeamService teamService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private DTOConversionService dtoConversionService;
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName()).orElse(null);
    }
    
    @GetMapping
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        List<Team> teams = teamService.getAllTeams();
        List<TeamDTO> teamDTOs = teams.stream()
            .map(dtoConversionService::convertToTeamDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(teamDTOs);
    }
    
    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<TeamDTO>> getTeamsByTournament(@PathVariable Long tournamentId) {
        try {
            List<Team> teams = teamService.getTeamsByTournament(tournamentId);
            List<TeamDTO> teamDTOs = teams.stream()
                .map(dtoConversionService::convertToTeamDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(teamDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/my-teams")
    public ResponseEntity<List<TeamDTO>> getMyTeams() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Team> teams = teamService.getTeamsByUser(currentUser);
        List<TeamDTO> teamDTOs = teams.stream()
            .map(dtoConversionService::convertToTeamDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(teamDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeam(@PathVariable Long id) {
        try {
            Team team = teamService.getTeamById(id);
            TeamDTO teamDTO = dtoConversionService.convertToTeamDTO(team);
            return ResponseEntity.ok(teamDTO);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createTeam(@RequestBody TeamRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Only regular users can create teams, not admins
            if (currentUser.getRole().equals(User.Role.ADMIN)) {
                return ResponseEntity.status(403).body("Administrators cannot create teams. Only regular users can create teams.");
            }
            
            Team team = teamService.createTeam(request, currentUser);
            TeamDTO teamDTO = dtoConversionService.convertToTeamDTO(team);
            return ResponseEntity.ok(teamDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeam(@PathVariable Long id, @RequestBody TeamRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            Team team = teamService.updateTeam(id, request, currentUser);
            TeamDTO teamDTO = dtoConversionService.convertToTeamDTO(team);
            return ResponseEntity.ok(teamDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeam(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            teamService.deleteTeam(id, currentUser);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}