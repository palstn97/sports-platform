package com.sportsai.sports_platform.domain.match.service;

import com.sportsai.sports_platform.domain.match.client.FootballApiClient;
import com.sportsai.sports_platform.domain.match.dto.MatchResponseDto;
import com.sportsai.sports_platform.domain.match.entity.Match;
import com.sportsai.sports_platform.domain.match.repository.MatchRepository;
import com.sportsai.sports_platform.domain.prediction.entity.Prediction;
import com.sportsai.sports_platform.domain.prediction.repository.PredictionRepository;
import com.sportsai.sports_platform.domain.team.entity.Team;
import com.sportsai.sports_platform.domain.team.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final FootballApiClient footballApiClient;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final PredictionRepository predictionRepository; // ✅ 추가

    @Transactional
    public void fetchAndSaveMatches(String competitionCode, String dateFrom, String dateTo) {
        Map<String, Object> response = footballApiClient.getMatches(competitionCode, dateFrom, dateTo);

        List<Map<String, Object>> matches = (List<Map<String, Object>>) response.get("matches");
        if (matches == null) return;

        for (Map<String, Object> matchData : matches) {
            Long externalId = Long.valueOf(matchData.get("id").toString());

            // 경기 상태
            String status = (String) matchData.get("status");

            // 스코어
            Map<String, Object> score = (Map<String, Object>) matchData.get("score");
            Map<String, Object> fullTime = (Map<String, Object>) score.get("fullTime");
            Integer homeScore = fullTime.get("home") != null ? (Integer) fullTime.get("home") : null;
            Integer awayScore = fullTime.get("away") != null ? (Integer) fullTime.get("away") : null;

            // 리그명
            Map<String, Object> competition = (Map<String, Object>) matchData.get("competition");
            String league = (String) competition.get("name");

            // 이미 있으면 스코어/상태 업데이트
            Match existingMatch = matchRepository.findByExternalId(externalId).orElse(null);
            if (existingMatch != null) {
                matchRepository.save(Match.builder()
                        .id(existingMatch.getId())
                        .externalId(externalId)
                        .sportType("SOCCER")
                        .homeTeam(existingMatch.getHomeTeam())
                        .awayTeam(existingMatch.getAwayTeam())
                        .league(league)
                        .scheduledAt(existingMatch.getScheduledAt())
                        .status(status)
                        .homeScore(homeScore)
                        .awayScore(awayScore)
                        .build());

                // ✅ FINISHED 경기 → isCorrect 업데이트
                if ("FINISHED".equals(status) && homeScore != null && awayScore != null) {
                    String actualResult;
                    if (homeScore > awayScore) actualResult = "HOME";
                    else if (awayScore > homeScore) actualResult = "AWAY";
                    else actualResult = "DRAW";

                    final String finalResult = actualResult;

                    List<Prediction> predictions = predictionRepository.findByMatchId(existingMatch.getId());
                    for (Prediction prediction : predictions) {
                        if (prediction.getIsCorrect() == null) {
                            boolean correct = prediction.getPredictedResult().equals(finalResult);
                            predictionRepository.save(Prediction.builder()
                                    .id(prediction.getId())
                                    .user(prediction.getUser())
                                    .match(prediction.getMatch())
                                    .predictedResult(prediction.getPredictedResult())
                                    .predictedScore(prediction.getPredictedScore())
                                    .isCorrect(correct)
                                    .points(correct ? 10 : 0)
                                    .predictedAt(prediction.getPredictedAt())
                                    .build());
                        }
                    }
                }

                continue;
            }

            // 홈팀/원정팀 저장
            Map<String, Object> homeTeamData = (Map<String, Object>) matchData.get("homeTeam");
            Map<String, Object> awayTeamData = (Map<String, Object>) matchData.get("awayTeam");

            Team homeTeam = saveOrGetTeam(homeTeamData, competitionCode);
            Team awayTeam = saveOrGetTeam(awayTeamData, competitionCode);

            // 경기 날짜
            String utcDate = (String) matchData.get("utcDate");
            LocalDateTime scheduledAt = LocalDateTime.parse(utcDate, DateTimeFormatter.ISO_DATE_TIME);

            Match match = Match.builder()
                    .externalId(externalId)
                    .sportType("SOCCER")
                    .homeTeam(homeTeam)
                    .awayTeam(awayTeam)
                    .league(league)
                    .scheduledAt(scheduledAt)
                    .status(status)
                    .homeScore(homeScore)
                    .awayScore(awayScore)
                    .build();

            matchRepository.save(match);
        }
    }

    private Team saveOrGetTeam(Map<String, Object> teamData, String competitionCode) {
        Long externalId = Long.valueOf(teamData.get("id").toString());
        String name = (String) teamData.get("name");
        String crest = (String) teamData.get("crest");

        return teamRepository.findByExternalId(externalId)
                .orElseGet(() -> teamRepository.save(
                        Team.builder()
                                .externalId(externalId)
                                .name(name)
                                .logoUrl(crest)
                                .sportType("SOCCER")
                                .league(competitionCode)
                                .build()
                ));
    }

    public List<MatchResponseDto> getMatchesByLeague(String league) {
        return matchRepository.findByLeagueOrderByScheduledAtAsc(league)
                .stream()
                .map(MatchResponseDto::from)
                .collect(Collectors.toList());
    }

    public List<MatchResponseDto> getTodayMatches() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
        LocalDateTime start = today.atStartOfDay().minusHours(9);
        LocalDateTime end = today.atTime(23, 59, 59).minusHours(9);
        return matchRepository.findByScheduledAtBetween(start, end)
                .stream()
                .map(MatchResponseDto::from)
                .collect(Collectors.toList());
    }

    public List<MatchResponseDto> getMatchesByDate(String date) {
        LocalDate localDate = LocalDate.parse(date);
        LocalDateTime start = localDate.atStartOfDay().minusHours(9);
        LocalDateTime end = localDate.atTime(23, 59, 59).minusHours(9);
        return matchRepository.findByScheduledAtBetween(start, end)
                .stream()
                .map(MatchResponseDto::from)
                .collect(Collectors.toList());
    }

    public MatchResponseDto getMatchById(Long id) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("경기를 찾을 수 없습니다."));
        return MatchResponseDto.from(match);
    }
}