'use client';

import { useState, useEffect } from 'react';
import LeagueSelect from './LeagueSelect';

interface StandingResponseDto {
  position: number;
  teamName: string;
  teamLogoUrl: string;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export default function StandingTable() {
  const [selectedLeague, setSelectedLeague] = useState('PL');
  const [standings, setStandings] = useState<StandingResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/standings/${selectedLeague}`);
        const data = await res.json();
        setStandings(data);
      } catch (err) {
        console.error('순위 데이터 조회 실패', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, [selectedLeague]);

  return (
    <div className="flex-1">

      {/* 리그 선택 */}
      <LeagueSelect selectedLeague={selectedLeague} onLeagueSelect={setSelectedLeague} />

      {/* 순위표 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-[14px] text-[#a0a8c0]">순위 데이터를 불러오는 중...</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#eef0f6] overflow-hidden">

          {/* 테이블 헤더 */}
          <div className="grid grid-cols-[40px_1fr_40px_40px_40px_40px_40px_40px_50px] gap-2 px-4 py-3 border-b border-[#eef0f6] text-[11px] font-semibold text-[#a0a8c0] uppercase">
            <div className="text-center">#</div>
            <div>팀</div>
            <div className="text-center">경기</div>
            <div className="text-center">승</div>
            <div className="text-center">무</div>
            <div className="text-center">패</div>
            <div className="text-center">득실</div>
            <div className="text-center">득점</div>
            <div className="text-center font-bold text-[#1a56db]">승점</div>
          </div>

          {/* 테이블 바디 */}
          {standings.map((standing, i) => (
            <div
              key={standing.position}
              className={`grid grid-cols-[40px_1fr_40px_40px_40px_40px_40px_40px_50px] gap-2 px-4 py-3 items-center text-[13px] transition-all hover:bg-[#f7f8fc]
                ${i !== standings.length - 1 ? 'border-b border-[#eef0f6]' : ''}
                ${standing.position <= 4 ? 'border-l-2 border-l-[#1a56db]' : ''}
                ${standing.position === 5 ? 'border-l-2 border-l-[#f59e0b]' : ''}
                ${standing.position >= 18 ? 'border-l-2 border-l-[#e11d48]' : ''}
              `}
            >
              {/* 순위 */}
              <div className="text-center font-bold text-[#1a1f36]">{standing.position}</div>

              {/* 팀 */}
              <div className="flex items-center gap-2">
                {standing.teamLogoUrl && (
                  <img src={standing.teamLogoUrl} alt={standing.teamName} className="w-6 h-6 object-contain" />
                )}
                <span className="font-medium text-[#1a1f36]">{standing.teamName}</span>
              </div>

              {/* 경기수 */}
              <div className="text-center text-[#5a6282]">{standing.playedGames}</div>

              {/* 승 */}
              <div className="text-center text-[#5a6282]">{standing.won}</div>

              {/* 무 */}
              <div className="text-center text-[#5a6282]">{standing.draw}</div>

              {/* 패 */}
              <div className="text-center text-[#5a6282]">{standing.lost}</div>

              {/* 득실차 */}
              <div className={`text-center font-medium ${standing.goalDifference > 0 ? 'text-[#16a34a]' : standing.goalDifference < 0 ? 'text-[#e11d48]' : 'text-[#5a6282]'}`}>
                {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
              </div>

              {/* 득점 */}
              <div className="text-center text-[#5a6282]">{standing.goalsFor}</div>

              {/* 승점 */}
              <div className="text-center font-bold text-[#1a1f36]">{standing.points}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}