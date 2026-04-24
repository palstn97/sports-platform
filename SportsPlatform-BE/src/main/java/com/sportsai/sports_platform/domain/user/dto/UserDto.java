package com.sportsai.sports_platform.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

public class UserDto {

    @Getter
    @NoArgsConstructor
    public static class SignupRequest { // 회원가입할 때 프론트에서 받는 데이터
        private String email;
        private String password;
        private String nickname;
    }

    @Getter
    @NoArgsConstructor
    public static class LoginRequest {  // 로그인할 때 프론트에서 받는 데이터
        private String email;
        private String password;
    }

    @Getter
    @NoArgsConstructor
    public static class Response {  // 유저 정보를 프론트에 돌려줄 때 쓰는 데이터
        private Long id;
        private String email;
        private String nickname;
        private String subscriptionStatus;

        public Response(Long id, String email, String nickname, String subscriptionStatus) {    // 데이터를 돌려줄 때 사용하는 것이기에 직접 값을 넣어서 만들어야 함. 생성자 직접 작성
            this.id = id;
            this.email = email;
            this.nickname = nickname;
            this.subscriptionStatus = subscriptionStatus;
        }
    }

    @Getter
    @NoArgsConstructor
    public static class LoginResponse {
        private String accessToken;
        private String email;
        private String nickname;

        public LoginResponse(String accessToken, String email, String nickname) {
            this.accessToken = accessToken;
            this.email = email;
            this.nickname = nickname;
        }
    }
}
