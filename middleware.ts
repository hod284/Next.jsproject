import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from '@/lib/auth';
// 인증이 필요한 경로들
const protectedpath = [
    '/api/orders',
    '/api/stats',
    '/api/users'    
];
//인증이 필요없는 경로들
const publicPath =[
 '/api/auth/login',
 '/api/auth/register',
 '/api/auth/refresh',
 '/login',
 '/register'
];
export function middleware(request : NextRequest)
{
    const {pathname} = request.nextUrl;
    if(publicPath.some(path=> pathname.startsWith(path)))
        return NextResponse.next();
    const isprotectedpath = protectedpath.some(path=>pathname.startsWith(path));
    if(!isprotectedpath)
        return NextResponse.next();
    // 토큰확인
    const token = request.cookies.get('access-token')?.value|| request.cookies.get('auth-token')?.value|| request.headers.get('access-token')?.replace('Bearer ','');  
    if(!token)
    {
        if(pathname.startsWith('/api/'))
        {
            return NextResponse.json(
                {success : false ,error : '토큰이 필요합니다'},
                {status :401}
            );
        }
        //페이지 요청인 경우 로그인 페이지로 다이렉트
        const loginurl = new URL('/login',request.url);
        loginurl.searchParams.set('redirect',pathname);
        return NextResponse.redirect(loginurl);
    }
     // 토큰 검증
     const payload = verifyToken(token);

    if (!payload) {
       // 유효하지 않은 토큰
      if (pathname.startsWith('/api/')) {
         return NextResponse.json(
          { success: false, error: '유효하지 않은 토큰입니다' },
          { status: 401 }
         );
       }
       return NextResponse.next();
   }
    // 관리자 전용 경로 체크
    const adminOnlyPaths = ['/api/users'];
    // some은 한개라도 만족하면 된다
    const isAdminPath = adminOnlyPaths.some(path => pathname.startsWith(path));
    
    if (isAdminPath && payload.role !== '관리자') {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { success: false, error: '권한이 없습니다' },
                { status: 403 }
            );
        }
        
        // 페이지는 통과 (프론트엔드에서 처리)
        return NextResponse.next();
    }
    return NextResponse.next();
}
//미들 웨어 적용 경로 설정
// static이나image에서 는 제외하라는 의미
export const config ={matcher:['/((?!_next/static|_next/image|favicon.ico).*)',],};
