'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";  // ← AuthContext 사용!
import Link from "next/link";

export default function LoginPage()
{
   const router =useRouter();
   const { login } = useAuth();  // ← AuthContext의 login 함수!
   const [email,setEmail] = useState('');
   const [password,setPassword] =useState('');
   const [error,setError] =useState('');
   const [isLoading,setIsLoading] =useState(false);
   const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try{
     
        console.log('여기 로그인 성공');
         // ✅ AuthContext의 login 함수 사용!
         await login(email, password);
            
         console.log('✅ 로그인 성공! user 상태 업데이트됨');
            
        // 약간의 지연 후 이동 (상태 업데이트 대기)
        setTimeout(() => {
                router.push('/dashboard');
        }, 100);
     
    }
     catch(error)
     {
        setError(error instanceof Error ?error.message:'로그인 실패');
     }
     finally
     {
        setIsLoading(false);
     }
   };
 return (
    <div className="min-h-screen flex">
      {/* 왼쪽: 브랜딩 영역 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              비즈니스 관리를<br />
              더 쉽고 빠르게
            </h2>
            <p className="text-lg text-white/80">
              강력한 관리자 대시보드로 모든 데이터를 한눈에 확인하고<br />
              효율적으로 관리하세요.
            </p>
          </div>
        </div>

        {/* 특징 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              📈
            </div>
            <div>
              <h3 className="font-semibold">실시간 통계</h3>
              <p className="text-sm text-white/70">매출, 주문, 사용자 현황 실시간 확인</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              🔒
            </div>
            <div>
              <h3 className="font-semibold">안전한 보안</h3>
              <p className="text-sm text-white/70">JWT 기반 인증으로 데이터 보호</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              ⚡
            </div>
            <div>
              <h3 className="font-semibold">빠른 성능</h3>
              <p className="text-sm text-white/70">최적화된 인터페이스로 빠른 작업</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">
          © 2024 Admin Dashboard. All rights reserved.
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                로그인
              </h2>
              <p className="text-gray-600">
                계정에 로그인하여 대시보드를 이용하세요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
