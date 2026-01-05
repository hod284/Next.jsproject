import { query,isPostgresError,QueryParams } from '@/lib/db';
import { NextResponse } from "next/server";
import type { DbOrder,ApiResponse} from '@/types';

// get:모든 주문 조회
export async function GET(request:Request) {
    try
    {
        //는 요청 URL의 쿼리 파라미터를 읽는 코드
        //예로 /api/items?status=active&limit=20
        const {searchParams} = new URL(request.url);
        const status = searchParams.get('status');
        const limit = searchParams.get('limit') ||'10';

         const {queryText, params} = buildOrderQuery(status,limit);
         const result = await query(queryText,params);
         const  response : ApiResponse<DbOrder[]>={
                    success :true,
                    data: result.rows,   
         }
         return NextResponse.json(response);
    }
    catch(error)
    {
       console.log('주문 조회 에러 : ',error);
       return NextResponse.json(
           {success:false, error :'주문 조회 실패'},
           {status : 500}
       );    
    }
}
//post 새주문 생성
export async function POST(request:Request) {
    try
    {
        const body :DbOrder = await request.json();
        const { order_number,customer,product,amount,status}= body;

        //유효성 검사
         if(!order_number||!customer||!product||!amount)
         {
            return NextResponse.json(
                 {success: false ,error :'주문수량및 주문 번호 양 물품을 정확히 입력하세요'},
                 {status :400}
            );
         }
         const result = await query(`INSERT INTO orders( order_number,customer,product,amount,status, order_date)
                              VALUES($1,$2,$3,$4,$5,NOW()) RETURNING *` ,[order_number,customer,product,amount,status||'처리중']);
         const response : ApiResponse<DbOrder>={
            success : true,
            data : result.rows[0],
         };
         return NextResponse.json(response);
    }
    catch(error)
    {
        console.log("새주문 생성 에러 :" ,error);
        if(isPostgresError(error))
        {
            if(error.code ==='23505')
            {
                return NextResponse.json(
                    {success: false ,error: "이미 주문한 번호입니다"},
                    {status :409}
                );
            }
        }
        return NextResponse.json(
            {success:false,error: '주문생성 실패'},
            {status: 500}
        );
    }
}
// put주문 상태 업데이트
export async function PUT(request:Request) 
{
      try
      {
            const body = await request.json();
            const{order_number ,status } =body;
            // 유효성 검사
            if(!order_number|| !status)
            {
                return NextResponse.json(
                    {success: false , error : '아이디나 상태를 입력하세요'},
                    {status:400}
                );
            }
            const result  =await query( `
                             UPDATE orders SET status =$1,updated_at = NOW() WHERE  order_number = $2`
                             , [status,order_number]);
            if(result.rowCount === 0 )
            {
                return NextResponse.json(
                    {success : false , error : '주문을 찾을수 없습니다'},
                    {status: 404}
                );
            }
            const response  :ApiResponse<DbOrder>={
                success: true,
                data: result.rows[0]
            };
            return NextResponse.json(response);
      }    
      catch(error)
      {
        console.log('주문 정보 수정 에러 : ',error);
        return NextResponse.json(
            {success: false, error : '주문 정보 수정 실패'},
            {status: 500}); 
      }
}
function buildOrderQuery(
  status: string | null,
  limit: string
): { queryText: string; params: QueryParams } {
  const limitNum = parseInt(limit);

  if (status && status !== 'all') {
    return {
      queryText: `SELECT * FROM orders WHERE status = $1 ORDER BY order_date DESC LIMIT $2`,
      params: [status, limitNum],
    };
  }

  return {
    queryText: `SELECT * FROM orders ORDER BY order_date DESC LIMIT $1`,
    params: [limitNum],
  };
}