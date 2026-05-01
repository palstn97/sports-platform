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

    // 경기별 예측 비율 조회 (로그인 필요)
    @GetMapping("/{matchId}/ratio")
    public ResponseEntity<PredictionRatioDto> getRatio(
            @PathVariable Long matchId,
            HttpServletRequest request
    ) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String email = jwtTokenProvider.getEmailFromToken(token);
        return ResponseEntity.ok(predictionService.getRatio(matchId, email));
    }

    // 종료된 경기 비율 공개 조회 (로그인 불필요)
    @GetMapping("/{matchId}/ratio/public")
    public ResponseEntity<PredictionRatioDto> getPublicRatio(@PathVariable Long matchId) {
        return ResponseEntity.ok(predictionService.getPublicRatio(matchId));
    }

    @DeleteMapping("/{matchId}")
    public ResponseEntity<?> deletePrediction(
            @PathVariable Long matchId,
            HttpServletRequest request
    ) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String email = jwtTokenProvider.getEmailFromToken(token);
        predictionService.deletePrediction(matchId, email);
        return ResponseEntity.ok("예측이 취소되었습니다.");
    }
}