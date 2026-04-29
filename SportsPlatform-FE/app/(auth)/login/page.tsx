'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/useUserStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || '로그인에 실패했습니다.');
      }

      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.nickname, data.email, data.accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center px-4">
      <div className="w-full max-w-[480px]">

        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-[28px] font-extrabold text-[#1a1f36] tracking-tight">Scorify</span>
          </Link>
          <p className="text-[14px] text-[#a0a8c0] mt-2">스포츠 AI 예측 플랫폼에 오신 것을 환영해요</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl border border-[#eef0f6] shadow-[0_4px_24px_rgba(0,0,0,.06)] p-8">
          <h1 className="text-[22px] font-bold text-[#1a1f36] mb-1">로그인</h1>
          <p className="text-[13px] text-[#a0a8c0] mb-6">계정에 로그인하고 예측을 시작해보세요</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#1a1f36] mb-1.5">이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#c8cfe0] text-[14px] text-[#1a1f36] placeholder-[#a0a8c0] focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1a1f36] mb-1.5">비밀번호</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#c8cfe0] text-[14px] text-[#1a1f36] placeholder-[#a0a8c0] focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 transition-all"
              />
            </div>

            {error && (
              <div className="bg-[#fff1f2] text-[#e11d48] text-[13px] font-medium px-4 py-3 rounded-xl border border-[#fecdd3]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-[15px] font-bold text-white bg-gradient-to-r from-[#1a56db] to-[#3b82f6] hover:shadow-[0_8px_24px_rgba(26,86,219,.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="text-center text-[13px] text-[#a0a8c0] mt-6">
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className="text-[#1a56db] font-semibold hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}