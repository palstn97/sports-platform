package com.sportsai.sports_platform.domain.analysis.controller;

import com.sportsai.sports_platform.domain.analysis.dto.AiAnalysisDto;
import com.sportsai.sports_platform.domain.analysis.service.AiAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    // 경기 AI 분석 조회 (없으면 생성)
    @GetMapping("/{matchId}")
    public ResponseEntity<AiAnalysisDto> getAnalysis(@PathVariable Long matchId) {
        return ResponseEntity.ok(aiAnalysisService.getOrCreateAnalysis(matchId));
    }

    // AI 분석 삭제 (재분석 시 사용)
    @DeleteMapping("/{matchId}")
    public ResponseEntity<Void> deleteAnalysis(@PathVariable Long matchId) {
        aiAnalysisService.deleteAnalysis(matchId);
        return ResponseEntity.noContent().build();
    }
}