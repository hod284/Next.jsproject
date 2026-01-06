'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // 로그인 된 경우만 자동 리다이렉트
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 로그인 안 된 경우: 랜딩 페이지 표시
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        {/* 헤더 */}
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 text-white hover:bg-white/10 rounded-lg transition"
            >
              로그인
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              회원가입
            </button>
          </div>
        </nav>

        {/* 메인 콘텐츠 */}
        <div className="text-center text-white max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            비즈니스 관리를<br />
            더 쉽고 빠르게
          </h2>
          <p className="text-xl md:text-2xl text-white/80 mb-12">
            강력한 관리자 대시보드로 모든 데이터를 한눈에 확인하고<br />
            효율적으로 관리하세요
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition shadow-xl"
            >
              무료로 시작하기
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-bold text-lg hover:bg-white/20 transition"
            >
              로그인
            </button>
          </div>
        </div>

        {/* 특징 */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">실시간 통계</h3>
            <p className="text-white/80">매출, 주문, 사용자 현황을 실시간으로 확인하세요</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2">안전한 보안</h3>
            <p className="text-white/80">JWT 기반 인증으로 데이터를 안전하게 보호합니다</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">빠른 성능</h3>
            <p className="text-white/80">최적화된 인터페이스로 빠르게 작업하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
