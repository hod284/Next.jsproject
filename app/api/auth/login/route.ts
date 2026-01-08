
import { NextResponse } from "next/server";
import {query,transaction} from '@/lib/db'
import { verifyPassword } from "@/lib/password";
import { generateTokenPair, parseExpiresIn} from '@/lib/auth'
import type { LoginRequest ,AuthResponse,DbUser } from "@/types";
import { NODE_ENV, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN} from '@/lib/env';
//export는 모듈공개여부
export async function POST(request :Request) {
    try{
        const body = await request.json() as LoginRequest;
        const {email, password} = body;
        //유효성 검사
        if(!email ||!password)
        {
            return NextResponse.json(
               { success: false, error : "이메일이나 패스워드가 없습니다"} as AuthResponse,
               {status : 400}
            );
        }
        // 사용자 조회 
        const result = await query (`SELECT id, name, password, role, status FROM users WHERE email =$1`,[email]);

        if(result.rows.length === 0)
        {
            return NextResponse.json(
                {success: false ,error: '이메일 또는 비밀번호가 올바르지 않습니다'} as AuthResponse, 
                {status : 400}
            )
        }
        const user = result.rows[0] as DbUser;
        if(user.role === '관리자')
        {
        // 비밀번호 검증
        if(!user.password)
        {
            return NextResponse.json(
                {success: false ,error: '비밀번호가 설정되지 않은 계정입니다.'} as AuthResponse, 
                {status : 500}
            )
        }
        console.log(user.password);  
        console.log(password);  
        const ispasswordvaild = await verifyPassword(password,user.password);
         console.log('✅ 비말번호 통과후');  
        if(!ispasswordvaild)
        {   console.log('✅ 비말번호 오류'); 
            return NextResponse.json(
                {success: false ,error: '이메일 또는 비밀번호가 올바르지 않습니다'} as AuthResponse, 
                {status : 400}
            )
        }
        
        console.log('✅ 토큰 생성');  
        // accesstoken +refreshtoken 생성
        //!의미는 무조건 값이 있다라고 의미이고 지금 id가 undefine과 null중 한개의 값이 들어갈수 있다고 정의해서 정확한 타입 필요
        const {Accesstoken,RefreshToken} = generateTokenPair({
            userid :user.id!,
            email: user.email,
            role: user.role,  
        });
          console.log('✅ 토큰저장'); 
        //refresh token db에 저장
        const expiresat = new Date();
        expiresat.setDate(expiresat.getDate()+30);
       
        await transaction(async (client) =>{
         // 리프레쉬토큰 넣기
           await client.query (`
        INSERT INTO refresh_tokens (user_id,token,expires_at)
        VALUES($1,$2,$3)`, [user.id!, RefreshToken, expiresat]);
         // 오래된 리프레시 토큰 정리
        
        await client.query(
          `DELETE FROM refresh_tokens 
           WHERE user_id = $1 
           AND (expires_at < NOW() OR revoked = true)`,
          [user.id!]); 
        });
      
        // 응답생성 
           // 응답 생성
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      Accesstoken,
      RefreshToken,
    } as AuthResponse);
    // process.env.NODE_ENV === 'production' 개발환경 설정하는것 이것은 개발환경 아님
    // HttpOnly 쿠키로 Access Token 설정
    const maxAgeacess = parseExpiresIn(ACCESS_TOKEN_EXPIRES_IN);
    response.cookies.set('access-token',  Accesstoken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAgeacess ,
      path: '/',
    });
   const maxAgerefresh = parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN);
    // HttpOnly 쿠키로 Refresh Token 설정
    response.cookies.set('refresh-token', RefreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAgerefresh,
      path: '/',
    });
      return response;
  }
  else
  {
            return NextResponse.json(
                {success: false ,error: '관리자 계정이 아닙니다'} as AuthResponse, 
                {status : 500}
            )
  }
    }
    catch(error)
    {
       console.error("로그인 에러 : ",error);
       return NextResponse.json(
                {success: false ,error: '로그인 실패'} as AuthResponse, 
                {status : 500}
            )
    }
}