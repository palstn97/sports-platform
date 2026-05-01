package com.sportsai.sports_platform.domain.prediction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PredictionRatioDto {
    private double homeRatio;
    private double drawRatio;
    private double awayRatio;
    private long totalCount;
    private String myPrediction; // HOME, DRAW, AWAY 또는 null
}