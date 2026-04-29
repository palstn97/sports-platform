package com.sportsai.sports_platform.domain.match.dto;

import com.sportsai.sports_platform.domain.team.entity.Team;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamDto {

    private Long id;
    private String name;
    private String logoUrl;

    public static TeamDto from(Team team) {
        return TeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .logoUrl(team.getLogoUrl())
                .build();
    }
}