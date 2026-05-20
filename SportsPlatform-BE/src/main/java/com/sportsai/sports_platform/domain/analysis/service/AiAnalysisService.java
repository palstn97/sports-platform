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
        Optional<AiAnalysis> existing = aiAnalysisRepository.findByMatchId(matchId);
        if (existing.isPresent()) {
            return AiAnalysisDto.from(existing.get());
        }

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("경기를 찾을 수 없습니다."));

        String prompt = buildPrompt(match);
        String analysisText = callOpenAiApi(prompt);

        AiAnalysis analysis = AiAnalysis.builder()
                .match(match)
                .analysisText(analysisText)
                .build();
        aiAnalysisRepository.save(analysis);

        return AiAnalysisDto.from(analysis);
    }

    public Optional<AiAnalysisDto> findAnalysis(Long matchId) {
        return aiAnalysisRepository.findByMatchId(matchId)
                .map(AiAnalysisDto::from);
    }

    @Transactional
    public void deleteAnalysis(Long matchId) {
        aiAnalysisRepository.findByMatchId(matchId)
                .ifPresent(aiAnalysisRepository::delete);
    }

    private String buildPrompt(Match match) {
        StringBuilder sb = new StringBuilder();

        sb.append("당신은 축구 데이터 분석 전문가입니다. 아래 제공된 데이터만을 사용하여 경기를 분석해주세요.\n");
        sb.append("제공되지 않은 정보는 절대 추측하거나 추가하지 마세요.\n\n");

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
            sb.append("=== ").append(match.getHomeTeam().getName()).append(" 선수단 ===\n");
            sb.append(formatSquad(homeInfo)).append("\n");
        } catch (Exception e) {
            log.warn("홈팀 선수단 조회 실패: {}", e.getMessage());
        }

        // 원정팀 선수단
        try {
            Map<String, Object> awayInfo = footballApiClient
                    .getTeamInfo(match.getAwayTeam().getExternalId());
            sb.append("=== ").append(match.getAwayTeam().getName()).append(" 선수단 ===\n");
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

        // 분석 지시사항
        sb.append("\n=== 분석 지시사항 ===\n");
        sb.append("위 데이터를 기반으로 아래 항목을 분석해주세요:\n\n");

        sb.append("1. 최근 폼 분석\n");
        sb.append("   - 제공된 최근 5경기 결과에서 승/무/패 횟수를 직접 계산하세요\n");
        sb.append("   - 득점/실점 패턴을 분석하세요 (평균 득점, 평균 실점, 무실점 경기 수)\n");
        sb.append("   - 최근 경기 흐름이 상승세인지 하락세인지 판단하세요\n\n");

        sb.append("2. 전력 비교\n");
        sb.append("   - 제공된 리그 순위와 승점을 기반으로 현재 시즌 전체 성적을 비교하세요\n");
        sb.append("   - 두 팀의 순위 차이와 승점 차이를 언급하세요\n");
        sb.append("   - 제공된 선수단 명단을 기반으로 포지션별 구성을 비교하세요\n\n");

        sb.append("3. 득실 패턴 분석\n");
        sb.append("   - 최근 5경기 총 득점과 실점을 계산해 공격력/수비력을 평가하세요\n");
        sb.append("   - 다득점 경기와 무실점 경기 비율을 분석하세요\n");
        sb.append("   - 두 팀의 공격/수비 스타일을 비교하세요\n\n");

        sb.append("4. 리그 현황 및 동기부여\n");
        sb.append("   - 현재 순위를 바탕으로 각 팀이 우승/유럽대항전/강등권 중 어떤 상황인지 분석하세요\n");
        sb.append("   - 이번 경기가 각 팀에게 갖는 의미와 동기부여를 평가하세요\n\n");

        sb.append("5. 예상 결과\n");
        sb.append("   - 위 데이터에서 도출된 근거를 바탕으로 예상 결과를 제시하세요\n");
        sb.append("   - 승리 가능성이 높은 팀과 그 이유를 설명하세요\n");
        sb.append("   - 근거 없는 예측은 하지 마세요\n\n");

        sb.append("=== 작성 규칙 ===\n");
        sb.append("- 친근하고 전문적인 한국어로 작성\n");
        sb.append("- 마크다운 없이 일반 텍스트로 작성\n");
        sb.append("- 제공된 데이터에서 직접 계산/도출한 내용만 작성\n");
        sb.append("- 불확실한 내용은 반드시 추측 표현 사용 ('~로 예상됩니다', '~가 우세해 보입니다')\n");
        sb.append("- 700자 이내로 작성\n");

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
}