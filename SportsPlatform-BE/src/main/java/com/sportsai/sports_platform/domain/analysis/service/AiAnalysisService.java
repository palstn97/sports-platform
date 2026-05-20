package com.sportsai.sports_platform.domain.analysis.service;

import com.sportsai.sports_platform.domain.analysis.dto.AiAnalysisDto;
import com.sportsai.sports_platform.domain.analysis.entity.AiAnalysis;
import com.sportsai.sports_platform.domain.analysis.repository.AiAnalysisRepository;
import com.sportsai.sports_platform.domain.match.client.FootballApiClient;
import com.sportsai.sports_platform.domain.match.entity.Match;
import com.sportsai.sports_platform.domain.match.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final AiAnalysisRepository aiAnalysisRepository;
    private final MatchRepository matchRepository;
    private final FootballApiClient footballApiClient;

    @Value("${openai.api.key}")
    private String openAiApiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public AiAnalysisDto getOrCreateAnalysis(Long matchId) {
        // 이미 분석이 있으면 바로 반환 → API 호출 안 함
        Optional<AiAnalysis> existing = aiAnalysisRepository.findByMatchId(matchId);
        if (existing.isPresent()) {
            return AiAnalysisDto.from(existing.get());
        }

        // 경기 정보 조회
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("경기를 찾을 수 없습니다."));

        // 프롬프트 생성 → OpenAI API 호출 → 저장
        String prompt = buildPrompt(match);
        String analysisText = callOpenAiApi(prompt);

        AiAnalysis analysis = AiAnalysis.builder()
                .match(match)
                .analysisText(analysisText)
                .build();
        aiAnalysisRepository.save(analysis);

        return AiAnalysisDto.from(analysis);
    }

    @Transactional
    public void deleteAnalysis(Long matchId) {
        aiAnalysisRepository.findByMatchId(matchId)
                .ifPresent(aiAnalysisRepository::delete);
    }

    private String buildPrompt(Match match) {
        StringBuilder sb = new StringBuilder();
        sb.append("당신은 축구 전문 분석가입니다. 다음 경기를 분석해주세요.\n\n");
        sb.append("=== 경기 정보 ===\n");
        sb.append("리그: ").append(match.getLeague()).append("\n");
        sb.append("홈팀: ").append(match.getHomeTeam().getName()).append("\n");
        sb.append("원정팀: ").append(match.getAwayTeam().getName()).append("\n\n");

        // 홈팀 최근 5경기
        try {
            Map<String, Object> homeMatches = footballApiClient
                    .getTeamRecentMatches(match.getHomeTeam().getExternalId());
            sb.append("=== ").append(match.getHomeTeam().getName()).append(" 최근 5경기 ===\n");
            sb.append(formatRecentMatches(homeMatches)).append("\n");
        } catch (Exception e) {
            log.warn("홈팀 최근 경기 조회 실패: {}", e.getMessage());
        }

        // 원정팀 최근 5경기
        try {
            Map<String, Object> awayMatches = footballApiClient
                    .getTeamRecentMatches(match.getAwayTeam().getExternalId());
            sb.append("=== ").append(match.getAwayTeam().getName()).append(" 최근 5경기 ===\n");
            sb.append(formatRecentMatches(awayMatches)).append("\n");
        } catch (Exception e) {
            log.warn("원정팀 최근 경기 조회 실패: {}", e.getMessage());
        }

        // 홈팀 선수단
        try {
            Map<String, Object> homeInfo = footballApiClient
                    .getTeamInfo(match.getHomeTeam().getExternalId());
            sb.append("=== ").append(match.getHomeTeam().getName()).append(" 주요 선수 ===\n");
            sb.append(formatSquad(homeInfo)).append("\n");
        } catch (Exception e) {
            log.warn("홈팀 선수단 조회 실패: {}", e.getMessage());
        }

        // 원정팀 선수단
        try {
            Map<String, Object> awayInfo = footballApiClient
                    .getTeamInfo(match.getAwayTeam().getExternalId());
            sb.append("=== ").append(match.getAwayTeam().getName()).append(" 주요 선수 ===\n");
            sb.append(formatSquad(awayInfo)).append("\n");
        } catch (Exception e) {
            log.warn("원정팀 선수단 조회 실패: {}", e.getMessage());
        }

        // 리그 순위
        try {
            String competitionCode = getCompetitionCode(match.getLeague());
            if (competitionCode != null) {
                Map<String, Object> standings = footballApiClient.getStandings(competitionCode);
                sb.append("=== 현재 리그 순위 ===\n");
                sb.append(formatStandings(standings)).append("\n");
            }
        } catch (Exception e) {
            log.warn("리그 순위 조회 실패: {}", e.getMessage());
        }

        sb.append("\n위 데이터를 바탕으로 다음을 분석해주세요:\n");
        sb.append("1. 양 팀 최근 폼 분석 (최근 5경기 기반)\n");
        sb.append("2. 주요 선수 및 전력 비교\n");
        sb.append("3. 주요 관전 포인트\n");
        sb.append("4. 예상 결과 및 이유\n\n");
        sb.append("답변은 친근하고 전문적인 한국어로, 마크다운 없이 일반 텍스트로 작성해주세요. 500자 이내로 간결하게 작성해주세요.");

        return sb.toString();
    }

    private String getCompetitionCode(String leagueName) {
        return switch (leagueName) {
            case "Premier League" -> "PL";
            case "Primera Division" -> "PD";
            case "Bundesliga" -> "BL1";
            case "Serie A" -> "SA";
            case "Ligue 1" -> "FL1";
            case "UEFA Champions League" -> "CL";
            default -> null;
        };
    }

    private String formatRecentMatches(Map<String, Object> data) {
        if (data == null) return "데이터 없음\n";
        List<Map<String, Object>> matches = (List<Map<String, Object>>) data.get("matches");
        if (matches == null || matches.isEmpty()) return "최근 경기 데이터 없음\n";

        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> m : matches) {
            Map<String, Object> homeTeam = (Map<String, Object>) m.get("homeTeam");
            Map<String, Object> awayTeam = (Map<String, Object>) m.get("awayTeam");
            Map<String, Object> score = (Map<String, Object>) m.get("score");
            Map<String, Object> fullTime = score != null
                    ? (Map<String, Object>) score.get("fullTime") : null;

            String homeName = homeTeam != null ? (String) homeTeam.get("shortName") : "?";
            String awayName = awayTeam != null ? (String) awayTeam.get("shortName") : "?";
            String homeScore = fullTime != null && fullTime.get("home") != null
                    ? fullTime.get("home").toString() : "?";
            String awayScore = fullTime != null && fullTime.get("away") != null
                    ? fullTime.get("away").toString() : "?";

            sb.append(homeName).append(" ").append(homeScore)
                    .append(" - ").append(awayScore).append(" ").append(awayName).append("\n");
        }
        return sb.toString();
    }

    private String formatSquad(Map<String, Object> data) {
        if (data == null) return "데이터 없음\n";
        List<Map<String, Object>> squad = (List<Map<String, Object>>) data.get("squad");
        if (squad == null || squad.isEmpty()) return "선수단 데이터 없음\n";

        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (Map<String, Object> player : squad) {
            if (count >= 10) break;
            String name = (String) player.get("name");
            String position = (String) player.get("position");
            if (name != null) {
                sb.append(name);
                if (position != null) sb.append(" (").append(position).append(")");
                sb.append("\n");
                count++;
            }
        }
        return sb.toString();
    }

    private String formatStandings(Map<String, Object> data) {
        if (data == null) return "데이터 없음\n";
        List<Map<String, Object>> standingsList =
                (List<Map<String, Object>>) data.get("standings");
        if (standingsList == null || standingsList.isEmpty()) return "순위 데이터 없음\n";

        Map<String, Object> total = standingsList.stream()
                .filter(s -> "TOTAL".equals(s.get("type")))
                .findFirst()
                .orElse(null);
        if (total == null) return "순위 데이터 없음\n";

        List<Map<String, Object>> table = (List<Map<String, Object>>) total.get("table");
        if (table == null) return "순위 데이터 없음\n";

        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> row : table) {
            Map<String, Object> team = (Map<String, Object>) row.get("team");
            String teamName = team != null ? (String) team.get("shortName") : "?";
            int position = (int) row.get("position");
            int points = (int) row.get("points");
            int won = (int) row.get("won");
            int draw = (int) row.get("draw");
            int lost = (int) row.get("lost");

            sb.append(position).append("위 ").append(teamName)
                    .append(" | ").append(points).append("점")
                    .append(" | ").append(won).append("승 ")
                    .append(draw).append("무 ")
                    .append(lost).append("패\n");
        }
        return sb.toString();
    }

    private String callOpenAiApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + openAiApiKey);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");
        body.put("messages", List.of(message));
        body.put("max_tokens", 1024);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    OPENAI_API_URL, HttpMethod.POST, entity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices =
                    (List<Map<String, Object>>) responseBody.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> messageResponse =
                        (Map<String, Object>) choices.get(0).get("message");
                if (messageResponse != null) {
                    return (String) messageResponse.get("content");
                }
            }
        } catch (Exception e) {
            log.error("OpenAI API 호출 실패: {}", e.getMessage());
        }

        return "AI 분석을 불러오는 데 실패했습니다.";
    }

    // 분석 결과 조회만 (GPT 호출 안 함)
    public Optional<AiAnalysisDto> findAnalysis(Long matchId) {
        return aiAnalysisRepository.findByMatchId(matchId)
                .map(AiAnalysisDto::from);
    }
}