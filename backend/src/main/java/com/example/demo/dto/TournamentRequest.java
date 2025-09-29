package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TournamentRequest {
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxTeams = 16;
}