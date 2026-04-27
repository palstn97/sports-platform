'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }

      router.push('/login');
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
          <h1 className="text-[22px] font-bold text-[#1a1f36] mb-1">회원가입</h1>
          <p className="text-[13px] text-[#a0a8c0] mb-6">무료로 시작하고 AI 스포츠 예측을 경험해보세요</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* 이메일 */}
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

            {/* 닉네임 */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1a1f36] mb-1.5">닉네임</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="사용할 닉네임을 입력해주세요"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#c8cfe0] text-[14px] text-[#1a1f36] placeholder-[#a0a8c0] focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 transition-all"
              />
            </div>

            {/* 비밀번호 */}
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

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1a1f36] mb-1.5">비밀번호 확인</label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력해주세요"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#c8cfe0] text-[14px] text-[#1a1f36] placeholder-[#a0a8c0] focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10 transition-all"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-[#fff1f2] text-[#e11d48] text-[13px] font-medium px-4 py-3 rounded-xl border border-[#fecdd3]">
                {error}
              </div>
            )}

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-[15px] font-bold text-white bg-gradient-to-r from-[#1a56db] to-[#3b82f6] hover:shadow-[0_8px_24px_rgba(26,86,219,.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          {/* 로그인 링크 */}
          <p className="text-center text-[13px] text-[#a0a8c0] mt-6">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-[#1a56db] font-semibold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}