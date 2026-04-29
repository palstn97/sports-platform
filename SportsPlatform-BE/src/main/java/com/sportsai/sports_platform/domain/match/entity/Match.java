package com.sportsai.sports_platform.domain.match.entity;

import com.sportsai.sports_platform.domain.team.entity.Team;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long externalId;

    @Column(nullable = false, length = 20)
    private String sportType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_team_id", nullable = false)
    private Team homeTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_team_id", nullable = false)
    private Team awayTeam;

    @Column(nullable = false, length = 50)
    private String league;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Column(nullable = false, length = 20)
    private String status;

    private Integer homeScore;

    private Integer awayScore;
}