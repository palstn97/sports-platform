package com.sportsai.sports_platform.domain.prediction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PredictionHistoryDto {
    private Long id;
    private Long matchId;
    private String league;
    private String scheduledAt;
    private String homeTeamName;
    private String homeTeamLogo;
    private String awayTeamName;
    private String awayTeamLogo;
    private Integer homeScore;
    private Integer awayScore;
    private String predictedResult;
    private Boolean isCorrect;
    private String status;
}