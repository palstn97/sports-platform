package com.sportsai.sports_platform.domain.match.dto;

import com.sportsai.sports_platform.domain.match.entity.Match;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MatchResponseDto {

    private Long id;
    private String league;
    private String status;
    private LocalDateTime scheduledAt;
    private TeamDto homeTeam;
    private TeamDto awayTeam;
    private Integer homeScore;
    private Integer awayScore;

    public static MatchResponseDto from(Match match) {
        return MatchResponseDto.builder()
                .id(match.getId())
                .league(match.getLeague())
                .status(match.getStatus())
                .scheduledAt(match.getScheduledAt())
                .homeTeam(TeamDto.from(match.getHomeTeam()))
                .awayTeam(TeamDto.from(match.getAwayTeam()))
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .build();
    }
}