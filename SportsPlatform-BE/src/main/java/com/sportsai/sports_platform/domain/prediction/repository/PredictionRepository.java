package com.sportsai.sports_platform.domain.prediction.repository;

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

}