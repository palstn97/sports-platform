package com.sportsai.sports_platform.domain.news;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
@Getter
@NoArgsConstructor
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 255)
    private String url;

    @Column(nullable = false, length = 20)
    private String sportType;

    @Column(nullable = false, length = 100)
    private String source;

    @Column(nullable = false)
    private LocalDateTime publishedAt;
}