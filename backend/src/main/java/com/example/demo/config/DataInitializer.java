package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.entity.Tournament;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TournamentRepository tournamentRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create admin user if doesn't exist
        if (!userRepository.findByUsername("admin").isPresent()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            
            System.out.println("Created admin user: admin / admin123");
        }
        
        // Create test user if doesn't exist
        if (!userRepository.findByUsername("testuser").isPresent()) {
            User user = new User();
            user.setUsername("testuser");
            user.setEmail("test@example.com");
            user.setPassword(passwordEncoder.encode("test123"));
            user.setRole(User.Role.USER);
            user.setActive(true);
            userRepository.save(user);
            
            System.out.println("Created test user: testuser / test123");
        }
        
        // Create sample tournament if database is empty
        if (tournamentRepository.count() == 0) {
            User admin = userRepository.findByUsername("admin").get();
            
            Tournament tournament = new Tournament();
            tournament.setName("Spring Championship 2024");
            tournament.setDescription("Annual spring gaming championship");
            tournament.setStartDate(LocalDateTime.now().plusDays(7));
            tournament.setEndDate(LocalDateTime.now().plusDays(14));
            tournament.setMaxTeams(16);
            tournament.setStatus(Tournament.Status.UPCOMING);
            tournament.setCreatedBy(admin);
            tournament.setCreatedAt(LocalDateTime.now());
            
            tournamentRepository.save(tournament);
            
            System.out.println("Created sample tournament");
        }
    }
}