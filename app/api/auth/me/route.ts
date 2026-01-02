import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentuser } from "@/lib/auth";
import type { AuthResponse,DbUser } from "@/types";

export async function GET(request:Request) {
    try
    {
        const getcurrenuser = getCurrentuser(request);
        if(!getcurrenuser)
        {
            return NextResponse.json
            (
                {success:false, error :'인증이 필요 합니다' } as AuthResponse,
                {status : 401}
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
        // 비활성 계정 체크
        if(user.status != '활성')
        {
            return NextResponse.json(
              {success: false , error : '계정이 비활성화 되었습니다'} as AuthResponse,
              {status : 403}   
            );
        } 
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