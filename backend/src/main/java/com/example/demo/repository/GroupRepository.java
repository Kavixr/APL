package com.example.demo.repository;

import com.example.demo.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByTournamentId(Long tournamentId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Group g WHERE g.tournament.id = :tournamentId")
    void deleteByTournamentId(Long tournamentId);
}
