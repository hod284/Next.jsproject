import jwt from 'jsonwebtoken';
import type { JwtPayload } from '@/types';
import { JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from './env';


// 시간 문자열을 초로 변환 (예: "1h" -> 3600, "15m" -> 900)
export function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // 기본값 1시간
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': 
    return value;                    // 초
    case 'm': 
    return value * 60;               // 분
    case 'h': 
    return value * 60 * 60;          // 시간
    case 'd':
         return value * 60 * 60 * 24;     // 일
    default:
         return 3600;
  }
}
/**
 * Acesstoken(짧은 만료 시간)
 * @param payload - 토큰에 포함할 데이터
 * @returns jwtacesstoken
 */
// Omit는 첫번째 파라미터는 내가 넣는것 두번째 파라미터는 내가 넣지 말아야할것으로 서버에서 자동으로 생성
export function generateAcessToken(payload: Omit<JwtPayload,'iat'|'exp'|'tokenType'>): string{
       return jwt.sign(
        {...payload,tokenType:'access'},
        JWT_SECRET,
        {expiresIn: parseExpiresIn(ACCESS_TOKEN_EXPIRES_IN)},
       );
}
/**
 * REFRESHTOKEN생성(긴 만료시간)
 * @param playload -토큰에 포함할 데이터
 * @return jwtrefreshtoken
 */
export function generateRefreshToken(payload : Omit<JwtPayload,'iat'|'exp'|'tokenType'>): string
{
    return jwt.sign(
    {...payload,tokenType : 'refresh'},
         JWT_SECRET ,
     {expiresIn :parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN)},
    );
}
/**
 * 두토큰 모두 생성 
 */
export function generateTokenPair(payload : Omit<JwtPayload,'iat'|'exp'|'tokenType'>): { Accesstoken : string; RefreshToken :string;}
{
   return {Accesstoken :generateAcessToken(payload),RefreshToken :generateRefreshToken(payload)};
}
/**
 * request에서 토큰 추출(ACess 토큰)
 * @param request - next.js request객체
 * @return 토큰 또는 null
 */
export function AcessToken(request : Request):string | null{
    //Authorization 추출
    const authHeader =request.headers.get('Authorization');
    if(authHeader&&authHeader.startsWith('Bearer '))
    {
        return authHeader.substring(7);
    }
    //cookie에서 추출(acess-token우선)
    const cookieheader =request.headers.get('Cookie');
     if(cookieheader)
     {
       const co = parseCookie(cookieheader);
       return co["access-token"] ||null;
    }
    return null;
}
/**
 * request에서 토큰 추출(refresh 토큰)
 * @param request - next.js request객체
 * @return 토큰 또는 null
 */
export function RefreshToken(request : Request):string | null{
    
    //cookie에서 추출(acess-token우선)
    const cookieheader =request.headers.get('Cookie');
     if(cookieheader)
     {
       const co = parseCookie(cookieheader);
       return co["refresh-token"] ||null;
    }
    return null;
}
// 쿠킹 헬퍼 함수
export function parseCookie(cookieHeader: string): Record<string,string>{
    return cookieHeader.split(';').reduce((acc,cookies) =>{
        const [key,value] = cookies.trim().split('=');
        if(key && value)
        {
            acc[key] =value;
        }
        return acc;
    },{}as Record<string,string>);
}
/**
 * jwt토큰 검증
 * @param token -검증할 토큰
 * @return - 토큰 정보 또는 null
 */
export function verifyToken(token: string): JwtPayload |null
{
    try
    {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    }
    catch(error)
    {
        console.log('검증 실패',error);
       return null;
    }
}
/**
 *  request에서 사용자 정보 추출
 * @param request - 토큰 
 * @returns - 사용자 정보 또는 null
 */
export function getCurrentuser(request :Request) :JwtPayload |null{
     const token = AcessToken(request);
     if(!token)
       return null;
     return  verifyToken(token);
}
