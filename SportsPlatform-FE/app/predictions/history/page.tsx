'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useUserStore } from '@/app/store/useUserStore';

interface PredictionHistoryDto {
  id: number;
  matchId: number;
  league: string;
  scheduledAt: string;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamName: string;
  awayTeamLogo: string;
  homeScore: number | null;
  awayScore: number | null;
  predictedResult: string;
  isCorrect: boolean | null;
  status: string;
}

const formatTime = (scheduledAt: string) => {
  const date = new Date(scheduledAt + 'Z');
  return date.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
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
  FINISHED: { label: '종료', color: '#6b7280' },
  POSTPONED: { label: '연기', color: '#f59e0b' },
  CANCELLED: { label: '취소', color: '#e11d48' },
};

export default function PredictionHistoryPage() {
  const router = useRouter();
  const { accessToken, isLoggedIn } = useUserStore();
  const [history, setHistory] = useState<PredictionHistoryDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predictions/my`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [accessToken, isLoggedIn]);

  const correctCount = history.filter(h => h.isCorrect === true).length;
  const finishedCount = history.filter(h => h.status === 'FINISHED').length;

  return (
    <div className="bg-[#f4f6fb] min-h-screen">
      <Header />
      <div className="max-w-[1280px] mx-auto px-10 py-6 flex gap-6">
        <Sidebar />
        <div className="flex-1">

          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="text-[#5a6282] hover:text-[#1a56db] transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-[18px] font-bold text-[#1a1f36]">내 예측 이력</h1>
          </div>

          {/* 통계 */}
          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-[#eef0f6] p-4 mb-4 flex gap-6">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[22px] font-bold text-[#1a1f36]">{history.length}</span>
                <span className="text-[11px] text-[#a0a8c0]">총 예측</span>
              </div>
              <div className="w-[1px] bg-[#eef0f6]" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[22px] font-bold text-[#1a56db]">{correctCount}</span>
                <span className="text-[11px] text-[#a0a8c0]">적중</span>
              </div>
              <div className="w-[1px] bg-[#eef0f6]" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[22px] font-bold text-[#e11d48]">
                  {finishedCount > 0 ? Math.round(correctCount / finishedCount * 100) : 0}%
                </span>
                <span className="text-[11px] text-[#a0a8c0]">적중률</span>
              </div>
            </div>
          )}

          {/* 예측 이력 목록 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-[14px] text-[#a0a8c0]">불러오는 중...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-[40px] mb-4">🔮</div>
              <div className="text-[15px] font-semibold text-[#1a1f36] mb-2">예측 이력이 없어요</div>
              <div className="text-[12px] text-[#a0a8c0]">승부 예측 페이지에서 예측해보세요!</div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((item) => {
                const status = statusLabel[item.status] || { label: item.status, color: '#a0a8c0' };
                const isFinished = item.status === 'FINISHED';

                return (
                  <div key={item.id} className="bg-white rounded-xl border border-[#eef0f6] p-4">
                    {/* 리그 + 날짜 + 상태 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#1a56db] bg-[#f0f4ff] px-2 py-[2px] rounded-full">
                          {item.league}
                        </span>
                        <span className="text-[11px] text-[#a0a8c0]">{formatTime(item.scheduledAt)}</span>
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: status.color }}>
                        {status.label}
                      </span>
                    </div>

                    {/* 팀 vs 팀 + 스코어 */}
                    <div className="flex items-center mb-3">
                      {/* 홈팀 - 오른쪽 정렬 */}
                      <div className="flex-1 flex items-center justify-end gap-2">
                        <span className="text-[13px] font-semibold text-[#1a1f36] text-right">{item.homeTeamName}</span>
                        {item.homeTeamLogo && (
                          <img src={item.homeTeamLogo} alt={item.homeTeamName} className="w-6 h-6 object-contain shrink-0" />
                        )}
                      </div>

                      {/* vs / 스코어 - 고정 너비 중앙 */}
                      <div className="w-[72px] shrink-0 flex items-center justify-center">
                        <span className="text-[14px] font-bold text-[#1a1f36]">
                          {isFinished ? `${item.homeScore ?? 0} - ${item.awayScore ?? 0}` : 'vs'}
                        </span>
                      </div>

                      {/* 어웨이팀 - 왼쪽 정렬 */}
                      <div className="flex-1 flex items-center justify-start gap-2">
                        {item.awayTeamLogo && (
                          <img src={item.awayTeamLogo} alt={item.awayTeamName} className="w-6 h-6 object-contain shrink-0" />
                        )}
                        <span className="text-[13px] font-semibold text-[#1a1f36]">{item.awayTeamName}</span>
                      </div>
                    </div>

                    {/* 내 예측 + 결과 */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#eef0f6]">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#a0a8c0]">내 예측</span>
                        <span className="text-[12px] font-bold text-[#1a1f36]">
                          {item.predictedResult === 'HOME' ? item.homeTeamName :
                           item.predictedResult === 'AWAY' ? item.awayTeamName : '무승부'}
                        </span>
                      </div>
                      {isFinished ? (
                        <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                          item.isCorrect === true
                            ? 'bg-[#f0fdf4] text-[#16a34a]'
                            : item.isCorrect === false
                            ? 'bg-[#fff0f3] text-[#e11d48]'
                            : 'bg-[#f4f6fb] text-[#a0a8c0]'
                        }`}>
                          {item.isCorrect === true ? '✓ 적중' : item.isCorrect === false ? '✗ 실패' : '대기중'}
                        </span>
                      ) : (
                        <span className="text-[12px] font-semibold text-[#a0a8c0] bg-[#f4f6fb] px-3 py-1 rounded-full">
                          대기중
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}