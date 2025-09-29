package com.example.demo.dto;

import lombok.Data;
import com.example.demo.entity.User;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private User.Role role = User.Role.USER;
}