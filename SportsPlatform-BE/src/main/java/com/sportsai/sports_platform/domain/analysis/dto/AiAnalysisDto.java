package com.sportsai.sports_platform.domain.analysis.dto;

import com.sportsai.sports_platform.domain.analysis.entity.AiAnalysis;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AiAnalysisDto {

    private Long id;
    private Long matchId;
    private String analysisText;
    private LocalDateTime createdAt;

    public static AiAnalysisDto from(AiAnalysis analysis) {
        return AiAnalysisDto.builder()
                .id(analysis.getId())
                .matchId(analysis.getMatch().getId())
                .analysisText(analysis.getAnalysisText())
                .createdAt(analysis.getCreatedAt())
                .build();
    }
}