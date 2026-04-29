package com.sportsai.sports_platform.domain.standing.repository;

import com.sportsai.sports_platform.domain.standing.entity.Standing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StandingRepository extends JpaRepository<Standing, Long> {

    // 특정 리그 순위 조회 (순위 순서대로)
    List<Standing> findByCompetitionCodeOrderByPositionAsc(String competitionCode);

    // 특정 리그 + 시즌 순위 조회
    List<Standing> findByCompetitionCodeAndSeasonOrderByPositionAsc(String competitionCode, Integer season);

    // 특정 리그 + 시즌 데이터 삭제 (업데이트 전 기존 데이터 삭제용)
    void deleteByCompetitionCodeAndSeason(String competitionCode, Integer season);
}