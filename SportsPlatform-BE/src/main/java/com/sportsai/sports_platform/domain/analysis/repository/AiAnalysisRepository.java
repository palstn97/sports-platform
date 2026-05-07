package com.sportsai.sports_platform.domain.analysis.repository;

import com.sportsai.sports_platform.domain.analysis.entity.AiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AiAnalysisRepository extends JpaRepository<AiAnalysis, Long> {

    Optional<AiAnalysis> findByMatchId(Long matchId);
}