package com.example.demo.controller;

import com.example.demo.dto.AssignTeamsToGroupRequest;
import com.example.demo.dto.GroupDTO;
import com.example.demo.entity.Group;
import com.example.demo.entity.User;
import com.example.demo.service.GroupService;
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
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {
    
    @Autowired
    private GroupService groupService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private DTOConversionService dtoConversionService;
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName()).orElse(null);
    }
    
    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<GroupDTO>> getGroupsByTournament(@PathVariable Long tournamentId) {
        try {
            List<Group> groups = groupService.getGroupsByTournamentId(tournamentId);
            List<GroupDTO> groupDTOs = groups.stream()
                .map(dtoConversionService::convertToGroupDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(groupDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/assign-teams")
    public ResponseEntity<?> assignTeamsToGroups(@RequestBody AssignTeamsToGroupRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            List<Group> groups = groupService.assignTeamsToGroupsRandomly(request, currentUser);
            List<GroupDTO> groupDTOs = groups.stream()
                .map(dtoConversionService::convertToGroupDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(groupDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/tournament/{tournamentId}")
    public ResponseEntity<?> deleteGroupsByTournament(@PathVariable Long tournamentId) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Only admins can delete groups
            if (!currentUser.getRole().equals(User.Role.ADMIN)) {
                return ResponseEntity.status(403).body("Only administrators can delete groups");
            }
            
            groupService.deleteGroupsByTournamentId(tournamentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
