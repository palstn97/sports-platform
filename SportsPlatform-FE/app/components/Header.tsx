'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-white/60 backdrop-blur-md border-b border-white/60 shadow-[0_10px_30px_rgba(0,0,0,.04)]">
        <nav className="w-full max-w-[1280px] mx-auto h-16 px-10 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[20px] font-extrabold tracking-tight text-[#1a1f36]">Scorify</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/login" className="relative text-[14px] font-semibold text-[#5a6282] hover:text-[#1a1f36] transition-colors group">
              로그인
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-[#1a56db] to-[#3b82f6] transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/signup" className="inline-flex items-center justify-center px-4 py-2 rounded-full text-[14px] font-bold text-white bg-gradient-to-r from-[#1a56db] to-[#3b82f6] shadow-[0_10px_30px_rgba(26,86,219,.25)] hover:shadow-[0_16px_40px_rgba(26,86,219,.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all">
              회원가입
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}