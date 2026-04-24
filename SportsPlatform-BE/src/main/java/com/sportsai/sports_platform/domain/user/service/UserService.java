package com.sportsai.sports_platform.domain.user.service;

import com.sportsai.sports_platform.common.security.JwtTokenProvider;
import com.sportsai.sports_platform.domain.user.dto.UserDto;
import com.sportsai.sports_platform.domain.user.entity.User;
import com.sportsai.sports_platform.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserDto.Response signup(UserDto.SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        User savedUser = userRepository.save(user);

        return new UserDto.Response(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getNickname(),
                savedUser.getSubscriptionStatus()
        );
    }

    // ← 아래 login 메서드 추가
    public UserDto.LoginResponse login(UserDto.LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 이메일입니다.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return new UserDto.LoginResponse(token, user.getEmail(), user.getNickname());
    }
}