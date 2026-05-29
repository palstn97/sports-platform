'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

const getTodayKST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

const formatTime = (scheduledAt: string) => {
  const date = new Date(scheduledAt + 'Z');
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul'
  });
};

const statusLabel: Record<string, { label: string; color: string }> = {
  TIMED: { label: '예정', color: '#a0a8c0' },
  SCHEDULED: { label: '예정', color: '#a0a8c0' },
  IN_PLAY: { label: 'LIVE', color: '#e11d48' },
  PAUSED: { label: '하프타임', color: '#f59e0b' },
  FINISHED: { label: '종료', color: '#6b7280' },
  POSTPONED: { label: '연기', color: '#f59e0b' },
  CANCELLED: { label: '취소', color: '#e11d48' },
};

export default function TodayMatches() {
  const [matches, setMatches] = useState<MatchResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/matches?date=${getTodayKST()}`
        );
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error('경기 조회 실패', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.league]) acc[match.league] = [];
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, MatchResponseDto[]>);

  return (
    <div className="bg-white rounded-xl border border-[#eef0f6] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[15px] font-bold text-[#1a1f36]">오늘의 경기</span>
        <Link href="/schedule" className="text-[12px] text-[#1a56db] hover:underline">
          전체 보기 →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="text-[28px] mb-2">⚽</span>
          <p className="text-[13px] text-[#a0a8c0]">오늘 예정된 경기가 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(groupedMatches).map(([league, leagueMatches]) => (
            <div key={league}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold text-[#1a56db] bg-[#f0f4ff] px-2 py-[2px] rounded-full">
                  {league}
                </span>
              </div>
              {leagueMatches.slice(0, 3).map((match) => {
                const status = statusLabel[match.status] || { label: match.status, color: '#a0a8c0' };
                const isFinished = match.status === 'FINISHED';
                const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';

                return (
                  <Link key={`${match.id}-${match.scheduledAt}`} href={`/matches/${match.id}`}>
                    <div className="flex items-center px-3 py-2.5 rounded-lg hover:bg-[#f7f8fc] transition-all cursor-pointer mb-1">
                      <div className="w-[50px] flex flex-col items-center flex-shrink-0">
                        <span className="text-[11px] font-semibold text-[#5a6282]">
                          {formatTime(match.scheduledAt)}
                        </span>
                        <span className="text-[10px] font-semibold mt-0.5 flex items-center gap-1" style={{ color: status.color }}>
                          {isLive && <span className="inline-block w-[4px] h-[4px] rounded-full bg-[#e11d48] animate-pulse" />}
                          {status.label}
                        </span>
                      </div>

                      <div className="flex-1 flex items-center gap-2 justify-end">
                        <span className={`text-[13px] font-semibold ${isFinished && match.homeScore! > match.awayScore! ? 'text-[#1a56db]' : 'text-[#1a1f36]'}`}>
                          {match.homeTeam.name}
                        </span>
                        {match.homeTeam.logoUrl && (
                          <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-6 h-6 object-contain" />
                        )}
                      </div>

                      <div className="w-[56px] flex items-center justify-center">
                        {isFinished || isLive ? (
                          <span className="text-[16px] font-bold text-[#1a1f36]">
                            {match.homeScore ?? 0} - {match.awayScore ?? 0}
                          </span>
                        ) : (
                          <span className="text-[12px] font-semibold text-[#c8cfe0]">vs</span>
                        )}
                      </div>

                      <div className="flex-1 flex items-center gap-2">
                        {match.awayTeam.logoUrl && (
                          <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-6 h-6 object-contain" />
                        )}
                        <span className={`text-[13px] font-semibold ${isFinished && match.awayScore! > match.homeScore! ? 'text-[#1a56db]' : 'text-[#1a1f36]'}`}>
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}