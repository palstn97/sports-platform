package com.sportsai.sports_platform.domain.standing.service;

import com.sportsai.sports_platform.domain.match.client.FootballApiClient;
import com.sportsai.sports_platform.domain.standing.entity.Standing;
import com.sportsai.sports_platform.domain.standing.repository.StandingRepository;
import com.sportsai.sports_platform.domain.team.entity.Team;
import com.sportsai.sports_platform.domain.team.repository.TeamRepository;
import com.sportsai.sports_platform.domain.standing.dto.StandingResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StandingService {

    private final FootballApiClient footballApiClient;
    private final StandingRepository standingRepository;
    private final TeamRepository teamRepository;

    // 특정 리그 순위 가져와서 DB에 저장
    @Transactional
    public void fetchAndSaveStandings(String competitionCode) {
        Map<String, Object> response = footballApiClient.getStandings(competitionCode);
        if (response == null) return;

        // 시즌 정보
        Map<String, Object> season = (Map<String, Object>) response.get("season");
        Integer seasonYear = Integer.valueOf(season.get("startDate").toString().substring(0, 4));

        // 기존 순위 데이터 삭제 (최신 데이터로 교체)
        standingRepository.deleteByCompetitionCodeAndSeason(competitionCode, seasonYear);

        // 리그명
        Map<String, Object> competition = (Map<String, Object>) response.get("competition");
        String competitionName = (String) competition.get("name");

        // 순위 데이터 파싱
        List<Map<String, Object>> standings = (List<Map<String, Object>>) response.get("standings");
        if (standings == null) return;

        // 첫 번째 타입 (TOTAL) 순위만 저장
        Map<String, Object> totalStanding = standings.stream()
                .filter(s -> "TOTAL".equals(s.get("type")))
                .findFirst()
                .orElse(standings.get(0));

        List<Map<String, Object>> table = (List<Map<String, Object>>) totalStanding.get("table");
        if (table == null) return;

        for (Map<String, Object> row : table) {
            Map<String, Object> teamData = (Map<String, Object>) row.get("team");
            Long teamExternalId = Long.valueOf(teamData.get("id").toString());
            String teamName = (String) teamData.get("name");
            String crest = (String) teamData.get("crest");

            // 팀 저장 또는 조회
            Team team = teamRepository.findByExternalId(teamExternalId)
                    .orElseGet(() -> teamRepository.save(
                            Team.builder()
                                    .externalId(teamExternalId)
                                    .name(teamName)
                                    .logoUrl(crest)
                                    .sportType("SOCCER")
                                    .league(competitionCode)
                                    .build()
                    ));

            Standing standing = Standing.builder()
                    .competitionCode(competitionCode)
                    .competitionName(competitionName)
                    .season(seasonYear)
                    .position((Integer) row.get("position"))
                    .team(team)
                    .playedGames((Integer) row.get("playedGames"))
                    .won((Integer) row.get("won"))
                    .draw((Integer) row.get("draw"))
                    .lost((Integer) row.get("lost"))
                    .points((Integer) row.get("points"))
                    .goalsFor((Integer) row.get("goalsFor"))
                    .goalsAgainst((Integer) row.get("goalsAgainst"))
                    .goalDifference((Integer) row.get("goalDifference"))
                    .build();

            standingRepository.save(standing);
        }

        log.info("{} 리그 순위 저장 완료", competitionCode);
    }

    // 특정 리그 순위 조회
    public List<StandingResponseDto> getStandings(String competitionCode) {
        return standingRepository.findByCompetitionCodeOrderByPositionAsc(competitionCode)
                .stream()
                .map(StandingResponseDto::from)
                .collect(Collectors.toList());
    }

}