package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.dto.TournamentRequest;
import com.example.demo.dto.TeamRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class RoleBasedAccessControlTest {

    @Autowired
    private TournamentService tournamentService;

    @Autowired
    private TeamService teamService;

    private User adminUser;
    private User regularUser;
    private TournamentRequest tournamentRequest;
    private TeamRequest teamRequest;

    @BeforeEach
    void setUp() {
        // Create admin user
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@test.com");
        adminUser.setPassword("password");
        adminUser.setRole(User.Role.ADMIN);
        adminUser.setActive(true);

        // Create regular user
        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setUsername("user");
        regularUser.setEmail("user@test.com");
        regularUser.setPassword("password");
        regularUser.setRole(User.Role.USER);
        regularUser.setActive(true);

        // Create tournament request
        tournamentRequest = new TournamentRequest();
        tournamentRequest.setName("Test Tournament");
        tournamentRequest.setDescription("Test Description");
        tournamentRequest.setStartDate(LocalDateTime.now().plusDays(1));
        tournamentRequest.setEndDate(LocalDateTime.now().plusDays(7));
        tournamentRequest.setMaxTeams(8);

        // Create team request
        teamRequest = new TeamRequest();
        teamRequest.setName("Test Team");
        teamRequest.setDescription("Test Team Description");
        teamRequest.setTournamentId(1L);
    }

    @Test
    void testAdminCanCreateTournament() {
        // This should pass - admins can create tournaments
        assertDoesNotThrow(() -> {
            tournamentService.createTournament(tournamentRequest, adminUser);
        });
    }

    @Test
    void testRegularUserCannotCreateTournament() {
        // This should fail - regular users cannot create tournaments
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            tournamentService.createTournament(tournamentRequest, regularUser);
        });
        
        assertEquals("Only administrators can create tournaments", exception.getMessage());
    }

    @Test
    void testRegularUserCanCreateTeam() {
        // This test verifies that regular users can create teams
        // Note: This test would need a valid tournament ID, so we'll just test the role check
        assertDoesNotThrow(() -> {
            // The role check should pass, even if the tournament lookup fails
            try {
                teamService.createTeam(teamRequest, regularUser);
            } catch (RuntimeException e) {
                // We expect "Tournament not found" since we don't have a real tournament
                // but NOT the admin restriction error
                assertNotEquals("Administrators cannot create teams. Only regular users can create teams.", 
                              e.getMessage());
            }
        });
    }

    @Test
    void testAdminCannotCreateTeam() {
        // This should fail - admins cannot create teams
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            teamService.createTeam(teamRequest, adminUser);
        });
        
        assertEquals("Administrators cannot create teams. Only regular users can create teams.", 
                    exception.getMessage());
    }

    @Test
    void testOnlyAdminCanUpdateTournament() {
        // Test that regular users cannot update tournaments
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            tournamentService.updateTournament(1L, tournamentRequest, regularUser);
        });
        
        assertEquals("Only administrators can update tournaments", exception.getMessage());
    }

    @Test
    void testOnlyAdminCanDeleteTournament() {
        // Test that regular users cannot delete tournaments
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            tournamentService.deleteTournament(1L, regularUser);
        });
        
        assertEquals("Only administrators can delete tournaments", exception.getMessage());
    }
}