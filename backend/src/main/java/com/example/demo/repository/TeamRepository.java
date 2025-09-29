package com.example.demo.repository;

import com.example.demo.entity.Team;
import com.example.demo.entity.Tournament;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    @Query("SELECT t FROM Team t JOIN FETCH t.createdBy WHERE t.tournament = :tournament")
    List<Team> findByTournament(Tournament tournament);
    
    List<Team> findByCreatedBy(User createdBy);
    boolean existsByNameAndTournament(String name, Tournament tournament);
    
    @Modifying
    @Transactional
    @Query("UPDATE Team t SET t.group = null WHERE t.tournament.id = :tournamentId")
    void clearGroupAssignmentsByTournamentId(Long tournamentId);
}