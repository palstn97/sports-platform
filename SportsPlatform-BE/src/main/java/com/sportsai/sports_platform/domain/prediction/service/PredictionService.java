package com.sportsai.sports_platform.domain.prediction.service;

import com.sportsai.sports_platform.domain.match.entity.Match;
import com.sportsai.sports_platform.domain.match.repository.MatchRepository;
import com.sportsai.sports_platform.domain.prediction.dto.PredictionRatioDto;
import com.sportsai.sports_platform.domain.prediction.dto.PredictionRequestDto;
import com.sportsai.sports_platform.domain.prediction.entity.Prediction;
import com.sportsai.sports_platform.domain.prediction.repository.PredictionRepository;
import com.sportsai.sports_platform.domain.user.entity.User;
import com.sportsai.sports_platform.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;

    // 예측 저장
    @Transactional
    public void savePrediction(String email, PredictionRequestDto dto) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new IllegalArgumentException("유저를 찾을 수 없습니다.");

        predictionRepository.findByUserIdAndMatchId(user.getId(), dto.getMatchId())
                .ifPresent(p -> { throw new IllegalStateException("이미 예측한 경기입니다."); });

        Match match = matchRepository.findById(dto.getMatchId())
                .orElseThrow(() -> new IllegalArgumentException("경기를 찾을 수 없습니다."));

        Prediction prediction = Prediction.builder()
                .user(user)
                .match(match)
                .predictedResult(dto.getPredictedResult())
                .build();

        predictionRepository.save(prediction);
    }

    // 경기별 예측 비율 조회
    public PredictionRatioDto getRatio(Long matchId, String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new IllegalArgumentException("유저를 찾을 수 없습니다.");

        boolean hasPredicted = predictionRepository
                .findByUserIdAndMatchId(user.getId(), matchId).isPresent();

        if (!hasPredicted) return null;

        List<Object[]> results = predictionRepository.countByMatchIdGroupByResult(matchId);

        long home = 0, draw = 0, away = 0;
        for (Object[] row : results) {
            String result = (String) row[0];
            long count = (Long) row[1];
            if ("HOME".equals(result)) home = count;
            else if ("DRAW".equals(result)) draw = count;
            else if ("AWAY".equals(result)) away = count;
        }

        long total = home + draw + away;
        if (total == 0) return new PredictionRatioDto(0, 0, 0, 0);

        double homeRatio = Math.round((double) home / total * 1000) / 10.0;
        double drawRatio = Math.round((double) draw / total * 1000) / 10.0;
        double awayRatio = Math.round(1000 - homeRatio * 10 - drawRatio * 10) / 10.0;

        return new PredictionRatioDto(homeRatio, drawRatio, awayRatio, total);
    }
}