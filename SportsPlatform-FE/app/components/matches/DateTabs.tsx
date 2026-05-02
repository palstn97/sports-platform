'use client';

// ✅ 브라우저 타임존 상관없이 항상 KST 기준
const getKSTDateString = (date: Date): string =>
  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); // "YYYY-MM-DD"

const getKSTDay = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayIndex = parseInt(
    date.toLocaleDateString('en-US', { timeZone: 'Asia/Seoul', weekday: 'short' })
      .replace('Sun', '0').replace('Mon', '1').replace('Tue', '2')
      .replace('Wed', '3').replace('Thu', '4').replace('Fri', '5').replace('Sat', '6')
  );
  return days[dayIndex];
};

const isToday = (date: Date): boolean =>
  getKSTDateString(date) === getKSTDateString(new Date());

const generateWeekDates = (weekOffset: number): Date[] => {
  // KST 오늘 날짜 문자열 → Date 객체 (시간 없이 날짜만)
  const todayKSTStr = getKSTDateString(new Date()); // "2026-05-02"
  const todayUTC = new Date(todayKSTStr + 'T00:00:00Z'); // UTC 기준 날짜 객체

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayUTC);
    d.setUTCDate(todayUTC.getUTCDate() + weekOffset * 7 + i);
    return d;
  });
};

interface DateTabsProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
}

export default function DateTabs({ selectedDate, onDateSelect, weekOffset, onWeekChange }: DateTabsProps) {
  const dates = generateWeekDates(weekOffset);

  return (
    <div className="bg-white rounded-xl border border-[#eef0f6] p-2 flex items-center gap-1 mb-4">
      <button
        onClick={() => onWeekChange(weekOffset - 1)}
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

        return (
          <button
            key={dateStr}
            onClick={() => onDateSelect(dateStr)}
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
                {getKSTDay(date)}
              </div>
            )}
          </button>
        );
      })}

      <button
        onClick={() => onWeekChange(weekOffset + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f4f6fb] transition-all flex-shrink-0 text-[#a0a8c0] hover:text-[#1a56db]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}