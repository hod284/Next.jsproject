import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentuser } from "@/lib/auth";
import type { AuthResponse,DbUser } from "@/types";
import { currentUser } from '@/lib/currentuser';
export async function GET(request:Request) {
    try
    {
        const getcurrenuser = getCurrentuser(request);
        if(!getcurrenuser)
        {
            console.log('현재 유저받기 실패');
            return NextResponse.json
            (
                {success:false, error :'인증이 필요 합니다' } as AuthResponse,
                {status : 400}
            );
        }
        // db에서 최신 정보 조회
        const result = await query(
            `SELECT id,name,email,role,status FROM users WHERE id =$1`, [getcurrenuser.userid]);
        if(result.rows.length ==0)
        {
            return NextResponse.json(
             {success: false , error: '정보를 찾을수 없습니다' } as AuthResponse,
             {status :404}     
            );
        }    
        const user = result.rows[0] as DbUser;
        //만약 페이지를 끄고 다시 들어갈때 리프레쉬 토큰이 만료가 안되었을 경우 최신 사용자 저장 
        currentUser.setUser({
                id: user.id!,
               name: user.name,
              email: user.email,
              role: user.role,
          });
           console.log('전체확인',currentUser.getAll());
        return NextResponse.json(
            {success : true ,user :{
                id: user.id!,
                email: user.email,
                name : user.name,
                role: user.role,
            }} as AuthResponse
        );
    }    
    catch(error : unknown)
    {
        console.log('정보조회 오류 : ',error);
        return NextResponse.json(
           {success :false, error: '사용자 정보조회하는데 실패 했습니다'} as AuthResponse,
           {status :500} 
        );

    } 
}