package com.sportsai.sports_platform.domain.prediction.controller;

import com.sportsai.sports_platform.domain.prediction.dto.PredictionRatioDto;
import com.sportsai.sports_platform.domain.prediction.dto.PredictionRequestDto;
import com.sportsai.sports_platform.domain.prediction.service.PredictionService;
import com.sportsai.sports_platform.common.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;
    private final JwtTokenProvider jwtTokenProvider;

    // 예측 저장 (로그인 필요)
    @PostMapping
    public ResponseEntity<?> predict(
            @RequestBody PredictionRequestDto dto,
            HttpServletRequest request
    ) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String email = jwtTokenProvider.getEmailFromToken(token);
        predictionService.savePrediction(email, dto);
        return ResponseEntity.ok("예측이 저장되었습니다.");
    }

    // 경기별 예측 비율 조회 (누구나 가능)
    @GetMapping("/{matchId}/ratio")
    public ResponseEntity<PredictionRatioDto> getRatio(
            @PathVariable Long matchId,
            HttpServletRequest request
    ) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String email = jwtTokenProvider.getEmailFromToken(token);
        return ResponseEntity.ok(predictionService.getRatio(matchId, email));
    }
}