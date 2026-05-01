'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import PredictionCard from '../components/predictions/PredictionCard';

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

const toKST = (date: Date) => new Date(date.getTime() + 9 * 60 * 60 * 1000);
const formatDate = (date: Date) => toKST(date).toISOString().split('T')[0];
const formatDay = (date: Date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[toKST(date).getDay()];
};
const isToday = (date: Date) => formatDate(date) === formatDate(new Date());

const formatTime = (scheduledAt: string) => {
  const date = new Date(scheduledAt + 'Z');
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul'
  });
};

const generateWeekDates = () => {
  const dates = [];
  const now = new Date();
  const kstNow = toKST(now);
  const kstMidnight = new Date(kstNow);
  kstMidnight.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(kstMidnight.getTime() + i * 24 * 60 * 60 * 1000);
    dates.push(date);
  }
  return dates;
};

export default function PredictionsPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [matches, setMatches] = useState<MatchResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const dates = generateWeekDates();

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

  return (
    <div className="bg-[#f4f6fb] min-h-screen">
      <Header />
      <div className="max-w-[1280px] mx-auto px-10 py-6 flex gap-6">
        <Sidebar />
        <div className="flex-1">

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[18px] font-bold text-[#1a1f36]">승부 예측</h1>
            <button
              onClick={() => router.push('/predictions/history')}
              className="text-[13px] font-semibold text-[#1a56db] hover:underline"
            >
              내 예측 이력 →
            </button>
          </div>

          {/* 날짜 탭 */}
          <div className="bg-white rounded-xl border border-[#eef0f6] p-2 flex items-center gap-1 mb-4">
            {dates.map((date) => (
              <button
                key={formatDate(date)}
                onClick={() => setSelectedDate(formatDate(date))}
                className={`flex-1 py-2 rounded-lg text-center transition-all
                  ${selectedDate === formatDate(date)
                    ? 'bg-[#1a56db] text-white'
                    : 'hover:bg-[#f4f6fb] text-[#5a6282]'
                  }`}
              >
                <div className={`text-[13px] font-bold ${selectedDate === formatDate(date) ? 'text-white' : 'text-[#1a1f36]'}`}>
                  {toKST(date).getMonth() + 1}/{toKST(date).getDate()}
                </div>
                <div className={`text-[10px] mt-1 ${selectedDate === formatDate(date) ? 'text-blue-200' : 'text-[#a0a8c0]'}`}>
                  {isToday(date) ? '오늘' : formatDay(date)}
                </div>
              </button>
            ))}
          </div>

          {/* 경기 목록 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-[14px] text-[#a0a8c0]">불러오는 중...</div>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-[40px] mb-4">⚽</div>
              <div className="text-[15px] font-semibold text-[#1a1f36] mb-2">경기가 없어요</div>
              <div className="text-[12px] text-[#a0a8c0]">선택한 날짜에 경기가 없습니다</div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-white rounded-xl border border-[#eef0f6] p-4">
                  {/* 시간 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[14px] font-bold text-[#1a1f36]">
                      {formatTime(match.scheduledAt)}
                    </span>
                    <span className="text-[11px] text-[#a0a8c0]">{match.league}</span>
                  </div>

                  {/* 팀 정보 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {match.homeTeam.logoUrl && (
                        <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-6 h-6 object-contain" />
                      )}
                      <span className="text-[13px] font-semibold text-[#1a1f36]">{match.homeTeam.name}</span>
                    </div>
                    <span className="text-[12px] font-bold text-[#a0a8c0]">vs</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#1a1f36]">{match.awayTeam.name}</span>
                      {match.awayTeam.logoUrl && (
                        <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-6 h-6 object-contain" />
                      )}
                    </div>
                  </div>

                  {/* 예측 카드 */}
                  <PredictionCard
                    matchId={match.id}
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                    status={match.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}