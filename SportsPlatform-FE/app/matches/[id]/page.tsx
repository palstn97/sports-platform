'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PredictionCard from '../../components/predictions/PredictionCard';
import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';
import AiAnalysisCard from '@/app/components/analysis/AiAnalysisCard';

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

const statusLabel: Record<string, { label: string; color: string }> = {
  TIMED: { label: '예정', color: '#a0a8c0' },
  SCHEDULED: { label: '예정', color: '#a0a8c0' },
  IN_PLAY: { label: 'LIVE', color: '#e11d48' },
  PAUSED: { label: '하프타임', color: '#f59e0b' },
  FINISHED: { label: '종료', color: '#6b7280' },
  POSTPONED: { label: '연기', color: '#f59e0b' },
  CANCELLED: { label: '취소', color: '#e11d48' },
};

const formatTime = (scheduledAt: string) => {
  const date = new Date(scheduledAt + 'Z');
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul'
  });
};

const formatDate = (scheduledAt: string) => {
  const date = new Date(scheduledAt + 'Z');
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul'
  });
};

export default function MatchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<MatchResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${id}`);
        const data = await res.json();
        setMatch(data);
      } catch (err) {
        console.error('경기 데이터 조회 실패', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMatch();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f4f6fb]">
      <div className="text-[14px] text-[#a0a8c0]">불러오는 중...</div>
    </div>
  );

  if (!match) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f4f6fb]">
      <div className="text-[14px] text-[#a0a8c0]">경기를 찾을 수 없습니다.</div>
    </div>
  );

  const status = statusLabel[match.status] || { label: match.status, color: '#a0a8c0' };
  const isFinished = match.status === 'FINISHED';
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';

  return (
    <div className="bg-[#f4f6fb] min-h-screen">
      <Header />
      <div className="max-w-[1280px] mx-auto px-10 py-6 flex gap-6">
        <Sidebar />
        <div className="flex-1">

          {/* 뒤로가기 */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#5a6282] text-[13px] mb-4 hover:text-[#1a56db] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            돌아가기
          </button>

          {/* 경기 카드 */}
          <div className="bg-white rounded-xl border border-[#eef0f6] p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[12px] font-semibold text-[#1a56db] bg-[#f0f4ff] px-3 py-1 rounded-full">
                {match.league}
              </span>
              <span className="text-[12px] text-[#a0a8c0]">
                {formatDate(match.scheduledAt)} {formatTime(match.scheduledAt)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex flex-col items-center gap-2">
                {match.homeTeam.logoUrl && (
                  <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-16 h-16 object-contain" />
                )}
                <span className={`text-[14px] font-bold text-center ${isFinished && match.homeScore! > match.awayScore! ? 'text-[#1a56db]' : 'text-[#1a1f36]'}`}>
                  {match.homeTeam.name}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                {isFinished || isLive ? (
                  <span className="text-[32px] font-bold text-[#1a1f36]">
                    {match.homeScore ?? 0} - {match.awayScore ?? 0}
                  </span>
                ) : (
                  <span className="text-[24px] font-bold text-[#c8cfe0]">vs</span>
                )}
                <span className="text-[11px] font-semibold" style={{ color: status.color }}>
                  {status.label}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-2">
                {match.awayTeam.logoUrl && (
                  <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-16 h-16 object-contain" />
                )}
                <span className={`text-[14px] font-bold text-center ${isFinished && match.awayScore! > match.homeScore! ? 'text-[#1a56db]' : 'text-[#1a1f36]'}`}>
                  {match.awayTeam.name}
                </span>
              </div>
            </div>
          </div>

          {/* 승부 예측 */}
          <PredictionCard 
            matchId={match.id} 
            homeTeam={match.homeTeam} 
            awayTeam={match.awayTeam}
            status={match.status}
          />
          <AiAnalysisCard matchId={match.id} />
        </div>
      </div>
    </div>
  );
}