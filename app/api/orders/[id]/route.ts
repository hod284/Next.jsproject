import { query} from '@/lib/db';
import { NextResponse } from "next/server";
import type { DbOrder,ApiResponse} from '@/types';


export async function  GET(request :Request,{params}:{params:{id:string}}) {
    try
    {
        console.log('🔍 개별 주문 조회:', params.id);
        const result = await query(`SELECT * FROM orders WHERE id =$1`,[parseInt(params.id)]);
         if(result.rowCount ===0)
        {
             return NextResponse.json(
                {success: false, error:'주문을 찾을 수 없습니다'},
                {status:404}
             )
        }   

        const response : ApiResponse<DbOrder>={
            success : true,
            data:result.rows[0]
        };
        return NextResponse.json(response);
    }
    catch(error)
    {
        console.log('개별 주문 에러',error);
        return NextResponse.json(
            {success:false,error : '개별 주문 에러'},
            {status:500}
        )
    }
    
}