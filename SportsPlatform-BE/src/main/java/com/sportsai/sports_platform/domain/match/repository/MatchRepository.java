package com.sportsai.sports_platform.domain.match.repository;

import com.sportsai.sports_platform.domain.match.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {
    boolean existsByExternalId(Long externalId);
    List<Match> findByLeagueOrderByScheduledAtAsc(String league);
    List<Match> findByScheduledAtBetween(LocalDateTime start, LocalDateTime end);
    Optional<Match> findByExternalId(Long externalId);
}