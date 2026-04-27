package com.sportsai.sports_platform.domain.standing.controller;

import com.sportsai.sports_platform.domain.standing.entity.Standing;
import com.sportsai.sports_platform.domain.standing.service.StandingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/standings")
@RequiredArgsConstructor
public class StandingController {

    private final StandingService standingService;

    // 특정 리그 순위 조회
    @GetMapping("/{competitionCode}")
    public ResponseEntity<List<Standing>> getStandings(@PathVariable String competitionCode) {
        return ResponseEntity.ok(standingService.getStandings(competitionCode));
    }

    // 수동으로 순위 데이터 가져오기 (테스트용)
    @PostMapping("/fetch/{competitionCode}")
    public ResponseEntity<String> fetchStandings(@PathVariable String competitionCode) {
        standingService.fetchAndSaveStandings(competitionCode);
        return ResponseEntity.ok(competitionCode + " 순위 데이터를 성공적으로 가져왔습니다.");
    }

    // 전체 리그 순위 한 번에 가져오기
    @PostMapping("/fetch-all")
    public ResponseEntity<String> fetchAllStandings() {
        String[] codes = {"PL", "PD", "BL1", "SA", "FL1", "CL"};
        for (String code : codes) {
            standingService.fetchAndSaveStandings(code);
        }
        return ResponseEntity.ok("전체 리그 순위를 성공적으로 가져왔습니다.");
    }
}