package com.sportsai.sports_platform.domain.standing.dto;

import com.sportsai.sports_platform.domain.standing.entity.Standing;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StandingResponseDto {

    private Integer position;
    private String teamName;
    private String teamLogoUrl;
    private Integer playedGames;
    private Integer won;
    private Integer draw;
    private Integer lost;
    private Integer points;
    private Integer goalsFor;
    private Integer goalsAgainst;
    private Integer goalDifference;

    public static StandingResponseDto from(Standing standing) {
        return StandingResponseDto.builder()
                .position(standing.getPosition())
                .teamName(standing.getTeam().getName())
                .teamLogoUrl(standing.getTeam().getLogoUrl())
                .playedGames(standing.getPlayedGames())
                .won(standing.getWon())
                .draw(standing.getDraw())
                .lost(standing.getLost())
                .points(standing.getPoints())
                .goalsFor(standing.getGoalsFor())
                .goalsAgainst(standing.getGoalsAgainst())
                .goalDifference(standing.getGoalDifference())
                .build();
    }
}