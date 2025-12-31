import jwt from 'jsonwebtoken';
import type { JwtPayload } from '@/types';

const JWT_SECRETKEY = process.env.JWT_SECRET;
const ACESS_TOKEN_EXPIRES_IN = process.env.ACESS_TOKEN_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN; 

/**
 * Acesstoken(짧은 만료 시간)
 * @param payload - 토큰에 포함할 데이터
 * @returns jwtacesstoken
 */
// Omit는 첫번째 파라미터는 내가 넣는것 두번째 파라미터는 내가 넣지 말아야할것으로 서버에서 자동으로 생성
export function generateAcessToken(payload: Omit<JwtPayload,'iat'|'exp'|'tokenType'>): string{
       return jwt.sign(
        {...payload,tokenType:'access'},
        JWT_SECRETKEY,
        {expiresIn :ACESS_TOKEN_EXPIRES_IN }
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
           JWT_SECRETKEY,
     {expiresIn :REFRESH_TOKEN_EXPIRES_IN}
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
// 쿠킹 헬퍼 함수
export function parseCookie(cookieHeader: string): Record<string,string>{

    return cookieHeader.split(';').reduce((acc,cookies) =>{
        const [key,value] = cookieHeader.trim().split('=');
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
        const decoded = jwt.verify(token,JWT_SECRETKEY) as JwtPayload;
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
/**
 * refresh token 생성 (긴 만료시간)
 * @param payload -토큰에 포함할 데이터
 * @returns jwtrefreshtoken
 */
export function RefreshToken(payload : Omit<JwtPayload,'iat'|'exp'|'toekenType'>): string
{
   return jwt.sign(
    {...payload,tokenType: 'refresh'},
    JWT_SECRETKEY,
    {expiresIn: REFRESH_TOKEN_EXPIRES_IN}
   );
}