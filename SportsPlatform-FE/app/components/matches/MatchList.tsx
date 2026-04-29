'use client';

import { useState, useEffect } from 'react';
import DateTabs from './DateTabs';
import LeagueFilter from './LeagueFilter';
import MatchCard from './MatchCard';

interface TeamDto {
  id: number;
  name: string;
  logoUrl: string;
}

interface MatchResponseDto {
  id: number;
  league: string;
  status: string;
  scheduledAt: string;
  homeTeam: TeamDto;
  awayTeam: TeamDto;
  homeScore: number | null;
  awayScore: number | null;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function MatchList() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [matches, setMatches] = useState<MatchResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches?date=${selectedDate}`);
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error('경기 데이터 조회 실패', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [selectedDate]);

  // 리그 필터링
  const filteredMatches = selectedLeague === 'all'
    ? matches
    : matches.filter(m => m.league === selectedLeague);

  // 리그별 그룹핑
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    if (!acc[match.league]) acc[match.league] = [];
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, MatchResponseDto[]>);

  return (
    <div className="flex-1">

      {/* 날짜 탭 */}
      <DateTabs
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        weekOffset={weekOffset}
        onWeekChange={setWeekOffset}
      />

      {/* 리그 필터 */}
      <LeagueFilter selectedLeague={selectedLeague} onLeagueSelect={setSelectedLeague} />

      {/* 경기 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-[#a0a8c0]">경기 데이터를 불러오는 중...</div>
        </div>
      ) : Object.keys(groupedMatches).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-[40px] mb-4">⚽</div>
          <div className="text-[15px] font-semibold text-[#1a1f36] mb-2">경기가 없어요</div>
          <div className="text-[12px] text-[#a0a8c0]">선택한 날짜에 경기가 없습니다</div>
        </div>
      ) : (
        Object.entries(groupedMatches).map(([league, leagueMatches]) => (
          <div key={league} className="mb-4">
            {/* 리그 헤더 */}
            <div className="bg-white border border-[#eef0f6] rounded-t-xl px-4 py-3 flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#1a1f36]">{league}</span>
              <span className="text-[11px] text-[#a0a8c0] ml-auto">{leagueMatches.length}경기</span>
            </div>

            {/* 경기 카드 */}
            {leagueMatches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                isLast={i === leagueMatches.length - 1}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}