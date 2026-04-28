'use client';

import Link from 'next/link';
import { useUserStore } from '../../store/useUserStore';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { isLoggedIn, nickname, clearUser } = useUserStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    clearUser();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white/60 backdrop-blur-md border-b border-white/60 shadow-[0_10px_30px_rgba(0,0,0,.04)]">
        <nav className="w-full max-w-[1280px] mx-auto h-16 px-10 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[20px] font-extrabold tracking-tight text-[#1a1f36]">Scorify</span>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* 닉네임 버튼 */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 text-[14px] font-semibold text-[#1a1f36] border-b-2 border-[#1a56db] hover:text-[#1a56db] transition-colors"
                >
                  {nickname}님
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* 드롭다운 */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-36 bg-white rounded-xl border border-[#eef0f6] shadow-[0_8px_24px_rgba(0,0,0,.08)] overflow-hidden">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-[13px] font-medium text-[#5a6282] hover:bg-[#f4f6fb] hover:text-[#e11d48] transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="relative text-[14px] font-semibold text-[#5a6282] hover:text-[#1a1f36] transition-colors group"
                >
                  로그인
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-[#1a56db] to-[#3b82f6] transition-all duration-300 group-hover:w-full" />
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full text-[14px] font-bold text-white bg-gradient-to-r from-[#1a56db] to-[#3b82f6] shadow-[0_10px_30px_rgba(26,86,219,.25)] hover:shadow-[0_16px_40px_rgba(26,86,219,.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}