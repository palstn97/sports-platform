package com.sportsai.sports_platform.domain.prediction.repository;

import com.sportsai.sports_platform.domain.prediction.dto.RankingDto;
import com.sportsai.sports_platform.domain.prediction.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    // 특정 경기의 예측 전체 조회 -> 몇 명이 예측했는지 파악용
    List<Prediction> findByMatchId(Long matchId);

    // 특정 유저의 특정 경기 예측 조회 -> 중복 예측 방지에 사용
    Optional<Prediction> findByUserIdAndMatchId(Long userId, Long matchId);

    // 특정 경기의 예측 결과별 카운트 -> % 계산에 사용
    @Query("SELECT p.predictedResult, COUNT(p) FROM Prediction p WHERE p.match.id = :matchId GROUP BY p.predictedResult")
    List<Object[]> countByMatchIdGroupByResult(@Param("matchId") Long matchId);

    // 유저의 예측 전체 조회
    List<Prediction> findByUserIdOrderByPredictedAtDesc(Long userId);

    @Query("SELECT new com.sportsai.sports_platform.domain.prediction.dto.RankingDto(" +
            "u.nickname, " +
            "COUNT(p), " +
            "SUM(CASE WHEN p.isCorrect = true THEN 1L ELSE 0L END), " +
            "ROUND(SUM(CASE WHEN p.isCorrect = true THEN 1.0 ELSE 0.0 END) / COUNT(p) * 100, 1)) " +
            "FROM Prediction p JOIN p.user u " +
            "WHERE p.isCorrect IS NOT NULL " +
            "GROUP BY u.id, u.nickname " +
            "ORDER BY SUM(CASE WHEN p.isCorrect = true THEN 1L ELSE 0L END) DESC, COUNT(p) DESC")
    List<RankingDto> findRanking();

}