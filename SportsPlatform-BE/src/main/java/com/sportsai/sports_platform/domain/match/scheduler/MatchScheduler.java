package com.sportsai.sports_platform.domain.match.scheduler;

import com.sportsai.sports_platform.domain.match.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchScheduler {

    private final MatchService matchService;

    private static final String[] COMPETITION_CODES = {
            "PL",   // 프리미어리그
            "PD",   // 라리가
            "BL1",  // 분데스리가
            "SA",   // 세리에A
            "FL1",  // 리그1
            "CL"    // 챔피언스리그
    };

    // 2시간 마다 - 7일치 경기 일정 업데이트
    @Scheduled(cron = "0 0 */2 * * *")
    public void fetchUpcomingMatches() {
        log.info("경기 일정 업데이트 시작");
        String dateFrom = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String dateTo = LocalDate.now().plusDays(7).format(DateTimeFormatter.ISO_DATE);
        fetchMatchesForAllLeagues(dateFrom, dateTo);
        log.info("경기 일정 업데이트 완료");
    }

    // 매 5분마다 - 라이브 스코어 업데이트 -> 이 부분은 유료 플랜을 사용하지 않아서 의미가 없는 코드. 그렇기에 나중에 추후 확장할 시 주석 해제 후 진행하면 라이브 스코어 제공 가능
//    @Scheduled(fixedRate = 300000)
    public void updateLiveScores() {
        log.info("라이브 스코어 업데이트 시작");
        String today = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        fetchMatchesForAllLeagues(today, today);
        log.info("라이브 스코어 업데이트 완료");
    }

    // 공통 메서드 - 모든 리그 경기 데이터 가져오기
    public void fetchMatchesForAllLeagues(String dateFrom, String dateTo) {
        for (String code : COMPETITION_CODES) {
            try {
                matchService.fetchAndSaveMatches(code, dateFrom, dateTo);
                log.info("{} 경기 데이터 저장 완료", code);
                Thread.sleep(7000);
            } catch (Exception e) {
                log.error("{} 경기 데이터 저장 실패: {}", code, e.getMessage());
            }
        }
    }
}