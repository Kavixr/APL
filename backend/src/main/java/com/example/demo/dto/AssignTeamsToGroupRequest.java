package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignTeamsToGroupRequest {
    private Long tournamentId;
    private int numberOfGroups;
}
