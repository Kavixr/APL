package com.example.demo.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {
    private Long id;
    private String name;
    private String description;
    private TournamentBasicDTO tournament;
    private String createdBy;
    private LocalDateTime createdAt;
    private Long groupId;
    private String groupName;
}