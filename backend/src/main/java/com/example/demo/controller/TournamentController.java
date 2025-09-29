package com.example.demo.controller;

import com.example.demo.dto.TournamentRequest;
import com.example.demo.dto.TournamentDTO;
import com.example.demo.entity.Tournament;
import com.example.demo.entity.User;
import com.example.demo.service.TournamentService;
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
@RequestMapping("/api/tournaments")
@CrossOrigin(origins = "*")
public class TournamentController {
    
    @Autowired
    private TournamentService tournamentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private DTOConversionService dtoConversionService;
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userService.findByUsername(authentication.getName()).orElse(null);
    }
    
    @GetMapping
    public ResponseEntity<List<TournamentDTO>> getAllTournaments() {
        List<Tournament> tournaments = tournamentService.getAllTournaments();
        List<TournamentDTO> tournamentDTOs = tournaments.stream()
            .map(dtoConversionService::convertToTournamentDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(tournamentDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TournamentDTO> getTournament(@PathVariable Long id) {
        try {
            Tournament tournament = tournamentService.getTournamentById(id);
            TournamentDTO tournamentDTO = dtoConversionService.convertToTournamentDTO(tournament);
            return ResponseEntity.ok(tournamentDTO);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createTournament(@RequestBody TournamentRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Only admins can create tournaments
            if (!currentUser.getRole().equals(User.Role.ADMIN)) {
                return ResponseEntity.status(403).body("Only administrators can create tournaments");
            }
            
            Tournament tournament = tournamentService.createTournament(request, currentUser);
            TournamentDTO tournamentDTO = dtoConversionService.convertToTournamentDTO(tournament);
            return ResponseEntity.ok(tournamentDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTournament(@PathVariable Long id, @RequestBody TournamentRequest request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Only admins can update tournaments
            if (!currentUser.getRole().equals(User.Role.ADMIN)) {
                return ResponseEntity.status(403).body("Only administrators can update tournaments");
            }
            
            Tournament tournament = tournamentService.updateTournament(id, request, currentUser);
            TournamentDTO tournamentDTO = dtoConversionService.convertToTournamentDTO(tournament);
            return ResponseEntity.ok(tournamentDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTournamentStatus(@PathVariable Long id, @RequestBody String status) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Only admins can update tournament status
            if (!currentUser.getRole().equals(User.Role.ADMIN)) {
                return ResponseEntity.status(403).body("Only administrators can update tournament status");
            }
            
            Tournament.Status tournamentStatus = Tournament.Status.valueOf(status.replace("\"", ""));
            Tournament tournament = tournamentService.updateTournamentStatus(id, tournamentStatus, currentUser);
            TournamentDTO tournamentDTO = dtoConversionService.convertToTournamentDTO(tournament);
            return ResponseEntity.ok(tournamentDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTournament(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Only admins can delete tournaments
            if (!currentUser.getRole().equals(User.Role.ADMIN)) {
                return ResponseEntity.status(403).body("Only administrators can delete tournaments");
            }
            
            tournamentService.deleteTournament(id, currentUser);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}