package com.sportsai.sports_platform.domain.standing.entity;

import com.sportsai.sports_platform.domain.team.entity.Team;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "standings")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Standing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 리그 코드 (PL, PD, BL1 등)
    @Column(nullable = false, length = 10)
    private String competitionCode;

    // 리그명
    @Column(nullable = false, length = 50)
    private String competitionName;

    // 시즌 (ex. 2024)
    @Column(nullable = false)
    private Integer season;

    // 순위
    @Column(nullable = false)
    private Integer position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    // 경기 수
    @Column(nullable = false)
    private Integer playedGames;

    // 승
    @Column(nullable = false)
    private Integer won;

    // 무
    @Column(nullable = false)
    private Integer draw;

    // 패
    @Column(nullable = false)
    private Integer lost;

    // 승점
    @Column(nullable = false)
    private Integer points;

    // 득점
    @Column(nullable = false)
    private Integer goalsFor;

    // 실점
    @Column(nullable = false)
    private Integer goalsAgainst;

    // 득실차
    @Column(nullable = false)
    private Integer goalDifference;
}