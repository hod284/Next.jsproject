import { NextResponse } from "next/server";
import type { DbUser, ApiResponse  } from "@/types";
import { query, isPostgresError } from '@/lib/db';


// get 모든 사용자 조회
export async function GET(request : Request) {
    try
    {
      const {searchParams} = new URL(request.url);
      const role =searchParams.get('role');
      let qureytext ='select * from users order by id desc';
      let params : (string | number)[] =[];
      if(role &&role !== 'all')
      {
        qureytext ='select * from users where role = $1 order by id desc'
        params =[role];
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
// 새사용자 생성
export async function POST(request: Request)
{
    try
    {
        const body : DbUser = await request.json() as DbUser;
        const {name , email,role,status} = body;
        // 유효성 검사
        if(!name || !email)
        {
            return NextResponse.json(
                {success : false , error : "이메일이나 이름이 없습니다" },
                {status :400}
           );
        }
    
        // returning은 결과 값을 돌려받는 부분
        const result = await query(`
            INSERT  INTO users (name,email,role,status,joined)
            VALUES ($1,$2,$3,$4,NOW())
            RETURNING * `,[name,email,role||'사용자',status||'활성']);
        const response : ApiResponse<DbUser> ={
            success :true,
            data : result.rows[0]
        }
        return NextResponse.json(response,{status :201});  
    }
    catch(error : unknown)
     {
         console.error("사용자 생성 에러 : ",error);
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
            {success : false , error : '사용자 생성 실패'},
            {status :500}
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
            SET name = $1 ,email =$2,role =$3,status =$4 created_at =NOW() 
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
           console.error("사용자 생성 에러 : ",error);
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