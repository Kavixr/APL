package com.example.demo.repository;

import com.example.demo.entity.Tournament;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByCreatedBy(User createdBy);
    List<Tournament> findByStatus(Tournament.Status status);
    
    @Query("SELECT t FROM Tournament t JOIN FETCH t.createdBy ORDER BY t.createdAt DESC")
    List<Tournament> findByOrderByCreatedAtDesc();
    
    @Query("SELECT t FROM Tournament t JOIN FETCH t.createdBy WHERE t.id = :id")
    Optional<Tournament> findByIdWithCreatedBy(Long id);
}