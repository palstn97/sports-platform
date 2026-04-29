package com.sportsai.sports_platform.domain.match.controller;

import com.sportsai.sports_platform.domain.match.dto.MatchResponseDto;
import com.sportsai.sports_platform.domain.match.scheduler.MatchScheduler;
import com.sportsai.sports_platform.domain.match.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final MatchScheduler matchScheduler;

    // 오늘 경기 조회
    @GetMapping("/today")
    public ResponseEntity<List<MatchResponseDto>> getTodayMatches() {
        return ResponseEntity.ok(matchService.getTodayMatches());
    }

    // 날짜별 경기 조회
    @GetMapping
    public ResponseEntity<List<MatchResponseDto>> getMatchesByDate(
            @RequestParam String date
    ) {
        return ResponseEntity.ok(matchService.getMatchesByDate(date));
    }

    // 특정 리그 경기 조회
    @GetMapping("/league/{league}")
    public ResponseEntity<List<MatchResponseDto>> getMatchesByLeague(@PathVariable String league) {
        return ResponseEntity.ok(matchService.getMatchesByLeague(league));
    }

    // 수동으로 특정 리그 경기 데이터 가져오기
    @PostMapping("/fetch")
    public ResponseEntity<String> fetchMatches(
            @RequestParam String competitionCode,
            @RequestParam String dateFrom,
            @RequestParam String dateTo
    ) {
        matchService.fetchAndSaveMatches(competitionCode, dateFrom, dateTo);
        return ResponseEntity.ok("경기 데이터를 성공적으로 가져왔습니다.");
    }

    // 모든 리그 앞으로 7일치 한 번에 가져오기
    @PostMapping("/fetch-all")
    public ResponseEntity<String> fetchAllMatches() {
        String dateFrom = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String dateTo = LocalDate.now().plusDays(7).format(DateTimeFormatter.ISO_DATE);
        matchScheduler.fetchMatchesForAllLeagues(dateFrom, dateTo);
        return ResponseEntity.ok("전체 리그 경기 데이터를 가져왔습니다.");
    }

    // 이번 시즌 전체 데이터 한 번에 가져오기
    @PostMapping("/fetch-season")
    public ResponseEntity<String> fetchSeasonMatches() {
        String dateFrom = "2025-07-01";
        String dateTo = LocalDate.now().plusDays(7).format(DateTimeFormatter.ISO_DATE);
        matchScheduler.fetchMatchesForAllLeagues(dateFrom, dateTo);
        return ResponseEntity.ok("이번 시즌 전체 경기 데이터를 가져왔습니다.");
    }
}