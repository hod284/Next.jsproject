import { NextResponse } from "next/server";
import type { DbUser, ApiResponse  } from "@/types";
import { query, isPostgresError } from '@/lib/db';
import { currentUser } from '@/lib/currentuser';

// get 모든 사용자 조회
export async function GET(request : Request) {
    try
    {
      const {searchParams} = new URL(request.url);
      const role =searchParams.get('role');
      console.log('이메일 확인',currentUser.email);
      let qureytext ='SELECT * FROM users WHERE email != $1  ORDER BY  id DESC';
      let params : (string | number)[] =[currentUser.email!];
      if(role &&role !== 'all')
      {
        qureytext ='SELECT * FROM users WHERE role = $1 AND  email != $2 ORDER BY  id DESC'
        params =[role,currentUser.email!];
      }
      const result = await query(qureytext,params);
      const response: ApiResponse<DbUser[]> ={
        success: true,
        data : result.rows,
      };
      return NextResponse.json(response);
    }
    catch(error)
    {
        console.error('사용자 조회 에러 : ' , error);
        return NextResponse.json(
            {success :false , error :'사용자 조회 실패' },{status: 500}
        );
    }
}

// 사용자 수정
export async function PUT(request: Request)
{
     try
     {
        const body : DbUser = await request.json() as DbUser;
        const {id,name , email,role,status} = body;
        if(!id)
        { 
           return NextResponse.json(
            {success : false, error :'사용자 id가 필요합니다'},
            {status :400}
           );
        }
        const result = await query(
            `UPDATE users 
            SET name = $1 ,email =$2,role =$3,status =$4, created_at = NOW() 
            WHERE id = $5
            RETURNING *`, [name,email,role,status,id]);
         if(result.rowCount ===0) 
        {
                return NextResponse.json(
            {success : false, error :'사용자 id가 없습니다'},
            {status :404});
        }
        const response : ApiResponse<DbUser> ={
          success :true,
          data : result.rows[0]
        };
        return NextResponse.json(response);
     } 
     catch(error: unknown)
    {
           console.error("사용자 수정 에러 : ",error);
         if(isPostgresError(error))
         {
            if(error.code === '23505')
            {
                return NextResponse.json(
                    {success : false , error : "이미 존재하는 이메일입니다"},
                    {status : 409}
                );
            }
         }
         return NextResponse.json(
            {success : false , error : '사용자 수정실패'},
            {status :500}
         );
    } 
}
// 사용자 삭제
export async function DELETE(request : Request)
{
    try
    {
        const {searchParams} = new URL(request.url);
        const id = searchParams.get('email');  
        
        if (!id) {
           return NextResponse.json(
            { success: false, error: '사용자 ID가 필요합니다' },
            { status: 400 });
        }

        const result = await query('DELETE FROM users WHERE email = $1',[id]);
        if(result.rowCount === 0)
        {
               return NextResponse.json(
            { success: false, error: '사용자 email를 찾을수 없습니다' },
            { status: 404 });
        }
        const response :ApiResponse<null>= {success :true};
        return NextResponse.json(response);
    }
    catch(error:unknown)
    {
      console.error('사용자 삭제 에러:', error);
        return NextResponse.json(
         { success: false, error: '사용자 삭제 실패' },
         { status: 500 }
      );
    }
}