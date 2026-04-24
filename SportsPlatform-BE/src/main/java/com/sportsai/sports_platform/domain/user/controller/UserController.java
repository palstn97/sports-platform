package com.sportsai.sports_platform.domain.user.controller;

import com.sportsai.sports_platform.common.security.JwtTokenProvider;
import com.sportsai.sports_platform.domain.user.dto.UserDto;
import com.sportsai.sports_platform.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/signup")
    public ResponseEntity<UserDto.Response> signup(@RequestBody UserDto.SignupRequest request) {
        UserDto.Response response = userService.signup(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto.LoginResponse> login(@RequestBody UserDto.LoginRequest request) {
        UserDto.LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }
}