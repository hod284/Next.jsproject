'use client';

import React,{createContext,useContext,useState,useEffect} from "react";
import { authApi } from "@/lib/api";
import type { JwtPayload } from "@/types";


interface AuthContextType{
    user :JwtPayload| null;
    isLoading: boolean;
    login : (email :string,password:string) =>Promise<void>;
    logout: () =>Promise<void>;
    isAuthenticated:boolean
}
// 전역 상태 만들기
//로그인 정보 테마 언어
const AuthContext = createContext<AuthContextType|undefined> (undefined);

export function AuthProvider ({children}:{children:React.ReactNode})
{
    //컴포넌트 상태 관리
    const [user, setUser] = useState<JwtPayload|null>(null);
    const [isLoading,setIsLoading] =useState(true);
     const publicPaths = ['/', '/login', '/register'];
    // 페이지 정보 가져오기
    //사이드 이펙트 처리
    //API 호출
    //구독
    // 타이머
    useEffect (()=>{
        if(publicPaths)
        {
            setIsLoading(false);
             return;    
        }
          checkauth();
    },[]);
    const checkauth  =async() =>{
        try
        {
            //현재 사용자 정보 확인
            const response = await authApi.me();
            if(response.success&&response.user)
            {
                setUser({
                   userid : response.user.id,
                   email:response.user.email,
                   role : response.user.role,
                   tokenType:"access"
                });
            }
        }
        catch(error)
        {
            const refreshToken = localStorage.getItem('refreshToken');

            if(!refreshToken)
            {
                console.log('리프레쉬토큰이 없음');
                setUser(null);
                setIsLoading(false);
                return;
            }
            
            try
            {
                // credentials: `include` 쿠키보고 사용자 식별
                const refresh = await fetch(`/api/auth/refresh`,{
                   method :'POST',
                   headers:{'Contents-Type':'application/json'},
                   body:JSON.stringify({refreshToken}),
                   credentials: `include`,     
                });
                // 리프레쉬 토큰이 기간 안일경우 액세스토큰 갱신하고 다시사용자 정보 가져오기
                if(refresh.ok)
                {
                    const retry = await authApi.me();
                    if(retry.success&& retry.user)
                    {
                        setUser({
                        userid : retry.user.id,
                        email:retry.user.email,
                        role : retry.user.role,
                        tokenType:"access"
                       });
                    }
                }
                else
                {
                    console.log('리프레쉬토큰 만료');
                    localStorage.removeItem('refreshToken');
                    setUser(null);
                }
            }
            catch(error)
            {
                console.log('토큰 갱신 실패:',error);
                    localStorage.removeItem('refreshToken');
                    setUser(null);
            }
        }
        finally
        {
            setIsLoading(false);
        }
   };
   const login =async (email:string,password:string) =>{
    const response = await authApi.login(email,password);
    if( response.success && response.user )
    {
         setUser({
                   userid : response.user.id,
                   email:response.user.email,
                   role : response.user.role,
                   tokenType:"access"
                });
    }
   };
   const logout =async() =>{
    await authApi.LogOut();
    setUser(null);
   };
   // 리엑트 에서 전역인증 상태를 배포하는 코드 
   /*
   return (
  <AuthContext.Provider
   value={{
  user,          // 현재 로그인한 유저 정보
  isLoading,     // 인증 상태 확인 중인지
  login,         // 로그인 함수
  logout,        // 로그아웃 함수
  isAuthenticated: !!user // 로그인 여부(boolean)
}}
  >
    // children 이 Provider로 감싸진 모든 컴포넌트
    {children}
  </AuthContext.Provider>
);
   */ 
   return (
    <AuthContext.Provider value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
    }}
     >
        {children}
     </AuthContext.Provider>);
}
export function useAuth()
{
    const context = useContext(AuthContext);
    if(context === undefined)
          throw new Error('useAuth must be used within an AuthProvider');
        return context;
}
