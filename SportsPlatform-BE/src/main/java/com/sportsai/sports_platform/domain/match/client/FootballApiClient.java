package com.sportsai.sports_platform.domain.match.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class FootballApiClient {

    @Value("${football.api.key}")
    private String apiKey;

    @Value("${football.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Auth-Token", apiKey);
        return headers;
    }

    // 특정 리그의 경기 목록 조회
    public Map<String, Object> getMatches(String competitionCode, String dateFrom, String dateTo) {
        String url = apiUrl + "/competitions/" + competitionCode + "/matches"
                + "?dateFrom=" + dateFrom + "&dateTo=" + dateTo;

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class
        );

        return response.getBody();
    }

    // 특정 리그의 순위 조회
    public Map<String, Object> getStandings(String competitionCode) {
        String url = apiUrl + "/competitions/" + competitionCode + "/standings";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class
        );

        return response.getBody();
    }

    // 오늘 경기 조회
    public Map<String, Object> getTodayMatches() {
        String url = apiUrl + "/matches";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
        ResponseEntity<Map> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, Map.class
        );

        return response.getBody();
    }
}