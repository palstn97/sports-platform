package com.sportsai.sports_platform.domain.prediction.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PredictionRequestDto {
    private Long matchId;
    private String predictedResult; // HOME, DRAW, AWAY
}