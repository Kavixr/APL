package com.example.demo.dto;

import lombok.Data;

@Data
public class TeamRequest {
    private String name;
    private String description;
    private Long tournamentId;
}