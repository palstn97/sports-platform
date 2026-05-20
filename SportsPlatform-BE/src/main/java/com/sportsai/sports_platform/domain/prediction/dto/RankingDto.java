package com.sportsai.sports_platform.domain.prediction.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RankingDto {
    private String nickname;
    private Long totalPredictions;
    private Long correctPredictions;
    private Double accuracy;
}