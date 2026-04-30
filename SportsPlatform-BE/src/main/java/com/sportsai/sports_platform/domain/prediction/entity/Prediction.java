package com.sportsai.sports_platform.domain.prediction.entity;

import com.sportsai.sports_platform.domain.match.entity.Match;
import com.sportsai.sports_platform.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @Column(nullable = false, length = 20)
    private String predictedResult;

    @Column(length = 10)
    private String predictedScore;

    private Boolean isCorrect;

    private Integer points;

    @Column(nullable = false)
    private LocalDateTime predictedAt;

    @PrePersist
    public void prePersist() {
        this.predictedAt = LocalDateTime.now();
    }
}