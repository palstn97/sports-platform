'use client';

const leagues = [
  { code: 'all', name: '전체' },
  { code: 'Premier League', name: '프리미어리그' },
  { code: 'Primera Division', name: '라리가' },
  { code: 'Bundesliga', name: '분데스리가' },
  { code: 'Serie A', name: '세리에 A' },
  { code: 'Ligue 1', name: '리그 1' },
  { code: 'UEFA Champions League', name: 'UCL' },
];

interface LeagueFilterProps {
  selectedLeague: string;
  onLeagueSelect: (league: string) => void;
}

export default function LeagueFilter({ selectedLeague, onLeagueSelect }: LeagueFilterProps) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {leagues.map((league) => (
        <button
          key={league.code}
          onClick={() => onLeagueSelect(league.code)}
          className={`px-3 py-[6px] rounded-full text-[12px] font-medium border transition-all
            ${selectedLeague === league.code
              ? 'bg-[#1a56db] border-[#1a56db] text-white font-semibold'
              : 'border-[#eef0f6] text-[#5a6282] bg-white hover:border-[#1a56db] hover:text-[#1a56db]'
            }`}
        >
          {league.name}
        </button>
      ))}
    </div>
  );
}