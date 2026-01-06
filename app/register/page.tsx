'use client'

import  { useState } from "react";
import { useRouter } from "next/router";
import { authapi } from "@/lib/api";
import Link from "next/link";

// ⭐ 2번: 동적 렌더링 강제
// 모든 페이지를 정적으로 생성할때 useRouter() 작동 안 함 그래서 에러 밷음 동적 랜더링으로 바꿈
export const dynamic = 'force-dynamic';
export default function RegisterPage()
{
    const [isLoading ,setIsLoading] =useState(true);
    const [password ,setPassword] =useState('');
    const [name, setName] =useState('');
    const [email,setEmail] =useState('');
    const [confirmPassword,setConfirmPassword] =useState('');
    const router =useRouter();
    const [error,setError] =useState('');
    const handleSubmit = async(e:React.FormEvent)=>{
        e.preventDefault();
        setError('');
        if(password === confirmPassword)
        {
            setError('비밀번호가 일치하지 않습니다');
        }

        if(password.length<8)
        {
              setError('8자 이상이어야 합니다');
        }
        setIsLoading(true);
        try
        {
           const response = await authapi.register(name,email,password);
           if(response.success)
           {
            alert('회원가입 성공 ! 로그인 페이지로 이동합니다');
            router.push('/login');   
           }
           else
           {
              setError(response.error|| '회원가입 실패');
           }
        }
        catch(error)
        {
           setError(error instanceof Error ? error.message :'회원가입 실패');
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
              지금 시작하세요
            </h2>
            <p className="text-lg text-white/80">
              몇 분만에 계정을 생성하고<br />
              강력한 관리 기능을 경험해보세요.
            </p>
          </div>
        </div>

        {/* 혜택 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-lg">무료로 시작</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-lg">신용카드 불필요</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-lg">언제든지 취소 가능</p>
          </div>
        </div>

        <div className="text-sm text-white/60">
          © 2024 Admin Dashboard. All rights reserved.
        </div>
      </div>

      {/* 오른쪽: 회원가입 폼 */}
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
                회원가입
              </h2>
              <p className="text-gray-600">
                새 계정을 만들어 시작하세요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="홍길동"
                />
              </div>

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
                  placeholder="user@example.com"
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
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="8자 이상"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="비밀번호 재입력"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg mt-2"
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}