package com.sportsai.sports_platform.domain.prediction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PredictionRatioDto {
    private double homeRatio;   // 홈팀 승 %
    private double drawRatio;   // 무승부 %
    private double awayRatio;   // 원정팀 승 %
    private long totalCount;    // 전체 예측 수
}