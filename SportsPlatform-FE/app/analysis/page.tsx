'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import { useUserStore } from '@/app/store/useUserStore';

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

// ────────────────────────────────
// 날짜 유틸
// ────────────────────────────────
const getTodayKST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

const getKSTDateString = (date: Date): string =>
  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

const generateWeekDates = (weekOffset: number): Date[] => {
  const todayKSTStr = getTodayKST();
  const todayUTC = new Date(todayKSTStr + 'T00:00:00Z');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayUTC);
    d.setUTCDate(todayUTC.getUTCDate() + weekOffset * 7 + i);
    return d;
  });
};

const isToday = (date: Date): boolean =>
  getKSTDateString(date) === getTodayKST();

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

// ────────────────────────────────
// AI 분석 모달
// ────────────────────────────────
function AiAnalysisModal({
  match,
  onClose,
  accessToken,
}: {
  match: MatchResponseDto;
  onClose: () => void;
  accessToken: string | null;
}) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${match.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setAnalysis(data.analysisText);
      setDone(true);
    } catch (err) {
      console.error('AI 분석 조회 실패', err);
      setAnalysis('AI 분석을 불러오는 데 실패했습니다.');
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  const refetchAnalysis = async () => {
    setDone(false);
    setAnalysis('');
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${match.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${match.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setAnalysis(data.analysisText);
      setDone(true);
    } catch (err) {
      console.error('AI 재분석 실패', err);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  const isFinished = match.status === 'FINISHED';
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const status = statusLabel[match.status] || { label: match.status, color: '#a0a8c0' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-[#eef0f6]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#1a56db] bg-[#f0f4ff] px-2 py-[2px] rounded-full">
              {match.league}
            </span>
            <span className="text-[11px] text-[#a0a8c0]">{formatTime(match.scheduledAt)}</span>
            <span className="text-[11px] font-semibold" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f4f6fb] text-[#a0a8c0] hover:text-[#1a1f36] transition-all"
          >
            ✕
          </button>
        </div>

        {/* 경기 정보 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f6]">
          <div className="flex-1 flex flex-col items-center gap-2">
            {match.homeTeam.logoUrl && (
              <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-12 h-12 object-contain" />
            )}
            <span className="text-[13px] font-bold text-[#1a1f36] text-center">{match.homeTeam.name}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            {isFinished || isLive ? (
              <span className="text-[28px] font-bold text-[#1a1f36]">
                {match.homeScore ?? 0} - {match.awayScore ?? 0}
              </span>
            ) : (
              <span className="text-[20px] font-bold text-[#c8cfe0]">vs</span>
            )}
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            {match.awayTeam.logoUrl && (
              <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-12 h-12 object-contain" />
            )}
            <span className="text-[13px] font-bold text-[#1a1f36] text-center">{match.awayTeam.name}</span>
          </div>
        </div>

        {/* AI 분석 섹션 */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#f0f4ff] flex items-center justify-center">
                <span className="text-[14px]">🤖</span>
              </div>
              <span className="text-[14px] font-bold text-[#1a1f36]">AI 경기 분석</span>
              <span className="text-[10px] font-semibold text-[#1a56db] bg-[#f0f4ff] px-2 py-[2px] rounded-full">
                GPT-4o mini
              </span>
            </div>
            {done && (
              <button
                onClick={refetchAnalysis}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#5a6282] bg-[#f4f6fb] hover:bg-[#eef0f6] transition-all"
              >
                🔄 재분석
              </button>
            )}
          </div>

          {/* 빈 상태 */}
          {!analysis && !loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-[32px] mb-2">⚽</span>
              <p className="text-[13px] text-[#a0a8c0] mb-4">
                AI가 최근 경기 데이터를 분석해드립니다
              </p>
              <button
                onClick={fetchAnalysis}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#1a56db] text-white hover:bg-[#1544b8] transition-all"
              >
                ✨ 분석 시작
              </button>
            </div>
          )}

          {/* 로딩 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px] text-[#a0a8c0]">AI가 분석 중입니다...</span>
            </div>
          )}

          {/* 분석 결과 */}
          {analysis && !loading && (
            <>
              <div className="bg-[#f8f9fc] rounded-xl p-4">
                <p className="text-[13px] text-[#1a1f36] leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </p>
              </div>
              <p className="text-[10px] text-[#c0c4d0] mt-3 text-right">
                * AI 분석은 참고용이며 실제 결과와 다를 수 있습니다
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────
// 메인 페이지
// ────────────────────────────────
export default function AiAnalysisPage() {
  const router = useRouter();
  const { accessToken, isLoggedIn } = useUserStore();
  const [selectedDate, setSelectedDate] = useState(getTodayKST());
  const [weekOffset, setWeekOffset] = useState(0);
  const [matches, setMatches] = useState<MatchResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResponseDto | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/matches?date=${selectedDate}`
        );
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

  const dates = generateWeekDates(weekOffset);

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.league]) acc[match.league] = [];
    acc[match.league].push(match);
    return acc;
  }, {} as Record<string, MatchResponseDto[]>);

  return (
    <div className="bg-[#f4f6fb] min-h-screen">
      <Header />
      <div className="max-w-[1280px] mx-auto px-10 py-6 flex gap-6">
        <Sidebar />
        <div className="flex-1">

          {/* 페이지 제목 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[18px] font-bold text-[#1a1f36]">AI 분석</span>
          </div>

          {/* 날짜 탭 */}
          <div className="bg-white rounded-xl border border-[#eef0f6] p-2 flex items-center gap-1 mb-4">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f4f6fb] transition-all flex-shrink-0 text-[#a0a8c0] hover:text-[#1a56db]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {dates.map((date) => {
              const dateStr = getKSTDateString(date);
              const isSelected = selectedDate === dateStr;
              const [, month, day] = dateStr.split('-');
              const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
              const dayName = dayNames[date.getUTCDay()];

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-1 py-2 rounded-lg text-center transition-all ${
                    isSelected ? 'bg-[#1a56db] text-white' : 'hover:bg-[#f4f6fb] text-[#5a6282]'
                  }`}
                >
                  <div className={`text-[13px] font-bold ${isSelected ? 'text-white' : 'text-[#1a1f36]'}`}>
                    {parseInt(month)}/{parseInt(day)}
                  </div>
                  {isToday(date) ? (
                    <div className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-blue-200' : 'text-[#1a56db]'}`}>
                      오늘
                    </div>
                  ) : (
                    <div className={`text-[10px] mt-1 ${isSelected ? 'text-blue-200' : 'text-[#a0a8c0]'}`}>
                      {dayName}
                    </div>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f4f6fb] transition-all flex-shrink-0 text-[#a0a8c0] hover:text-[#1a56db]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

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
                <div className="bg-white border border-[#eef0f6] rounded-t-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#1a1f36]">{league}</span>
                  <span className="text-[11px] text-[#a0a8c0] ml-auto">{leagueMatches.length}경기</span>
                </div>
                {leagueMatches.map((match, i) => {
                  const status = statusLabel[match.status] || { label: match.status, color: '#a0a8c0' };
                  const isFinished = match.status === 'FINISHED';
                  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
                  const isLast = i === leagueMatches.length - 1;

                  return (
                    <button
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className={`w-full bg-white border border-[#eef0f6] border-t-0 hover:bg-[#f7f8fc] transition-all cursor-pointer text-left
                        ${isLast ? 'rounded-b-xl' : ''}`}
                    >
                      <div className="flex items-center px-4 py-3 gap-4">
                        {/* 시간/상태 */}
                        <div className="w-[60px] flex flex-col items-center flex-shrink-0">
                          <span className="text-[12px] font-semibold text-[#5a6282]">
                            {formatTime(match.scheduledAt)}
                          </span>
                          <span className="text-[10px] font-semibold mt-1 flex items-center gap-1" style={{ color: status.color }}>
                            {isLive && <span className="inline-block w-[5px] h-[5px] rounded-full bg-[#e11d48] animate-pulse" />}
                            {status.label}
                          </span>
                        </div>

                        {/* 홈팀 */}
                        <div className="flex-1 flex items-center gap-2 justify-end">
                          <span className={`text-[13px] font-semibold ${isFinished && match.homeScore! > match.awayScore! ? 'text-[#1a56db]' : 'text-[#1a1f36]'}`}>
                            {match.homeTeam.name}
                          </span>
                          {match.homeTeam.logoUrl && (
                            <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-7 h-7 object-contain" />
                          )}
                        </div>

                        {/* 스코어 */}
                        <div className="w-[60px] flex items-center justify-center">
                          {isFinished || isLive ? (
                            <span className="text-[18px] font-bold text-[#1a1f36]">
                              {match.homeScore ?? 0} - {match.awayScore ?? 0}
                            </span>
                          ) : (
                            <span className="text-[13px] font-semibold text-[#c8cfe0]">vs</span>
                          )}
                        </div>

                        {/* 원정팀 */}
                        <div className="flex-1 flex items-center gap-2">
                          {match.awayTeam.logoUrl && (
                            <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-7 h-7 object-contain" />
                          )}
                          <span className={`text-[13px] font-semibold ${isFinished && match.awayScore! > match.homeScore! ? 'text-[#1a56db]' : 'text-[#1a1f36]'}`}>
                            {match.awayTeam.name}
                          </span>
                        </div>

                        {/* AI 분석 버튼 힌트 */}
                        <div className="flex-shrink-0">
                          <span className="text-[11px] font-semibold text-[#1a56db] bg-[#f0f4ff] px-2 py-1 rounded-full">
                            경기 분석
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI 분석 모달 */}
      {selectedMatch && (
        <AiAnalysisModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}