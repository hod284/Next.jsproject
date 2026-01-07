import { NextResponse } from "next/server";
import {query} from '@/lib/db'
import { getCurrentuser } from "@/lib/auth";
import type { AuthResponse } from "@/types";

export async function POST(request:Request) {
    try
    {
       //현재 사용자 정보 가져오기
       const currentuser = getCurrentuser(request);
       if(currentuser)
       {
        //db에 해당 사용자의 모든 refresh token 무효화
        await query(`UPDATE refresh_tokens 
            SET revoked =true, revoked_at = NOW() 
            WHERE user_id =$1 AND revoked =false  
            `, [currentuser.userid]);
       }
       //응답 생성
       const response = NextResponse.json(
        {success:true  } as AuthResponse);
      // 모든 쿠키 삭제
      response.cookies.delete('access-token');
      response.cookies.delete('refresh-token');

      return response;
    }
    catch(error:unknown)
    {
        console.log('로그아웃 에러 :' ,error);
        return NextResponse.json(
            {success: false , error : '로그아웃 에러'} as AuthResponse,
            {status : 500}
        )
    }
    
}