package com.example.demo.service;

import com.example.demo.entity.Tournament;
import com.example.demo.entity.User;
import com.example.demo.repository.TournamentRepository;
import com.example.demo.dto.TournamentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TournamentService {
    
    @Autowired
    private TournamentRepository tournamentRepository;
    
    public Tournament createTournament(TournamentRequest request, User createdBy) {
        // Ensure only admins can create tournaments
        if (!createdBy.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Only administrators can create tournaments");
        }
        
        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setDescription(request.getDescription());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setMaxTeams(request.getMaxTeams());
        tournament.setStatus(Tournament.Status.UPCOMING);
        tournament.setCreatedBy(createdBy);
        tournament.setCreatedAt(LocalDateTime.now());
        
        return tournamentRepository.save(tournament);
    }
    
    public List<Tournament> getAllTournaments() {
        return tournamentRepository.findByOrderByCreatedAtDesc();
    }
    
    public Tournament getTournamentById(Long id) {
        return tournamentRepository.findByIdWithCreatedBy(id)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
    }
    
    public Tournament updateTournament(Long id, TournamentRequest request, User user) {
        Tournament tournament = getTournamentById(id);
        
        // Only admins can update tournaments
        if (!user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Only administrators can update tournaments");
        }
        
        tournament.setName(request.getName());
        tournament.setDescription(request.getDescription());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setMaxTeams(request.getMaxTeams());
        
        return tournamentRepository.save(tournament);
    }
    
    public Tournament updateTournamentStatus(Long id, Tournament.Status status, User user) {
        Tournament tournament = getTournamentById(id);
        
        // Only admins can update tournament status
        if (!user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Only administrators can update tournament status");
        }
        
        tournament.setStatus(status);
        return tournamentRepository.save(tournament);
    }
    
    public void deleteTournament(Long id, User user) {
        Tournament tournament = getTournamentById(id);
        
        // Only admins can delete tournaments
        if (!user.getRole().equals(User.Role.ADMIN)) {
            throw new RuntimeException("Only administrators can delete tournaments");
        }
        
        tournamentRepository.delete(tournament);
    }
    
    public List<Tournament> getTournamentsByCreator(User creator) {
        return tournamentRepository.findByCreatedBy(creator);
    }
}