
import { generateAcessToken, verifyToken} from '@/lib/auth'
import { NextResponse } from 'next/server';

export async function POST(request:Request) {
    console.log('리프레쉬 토큰 콜');
    //리프레쉬 토큰 검즘 받기
    const {RefreshToken} = await request.json();
    //리프레쉬 토큰 검증
    const payload =verifyToken(RefreshToken); 
    if(!payload)
    {
         return NextResponse.json({ error: '유효하지 않음' }, { status: 401 });
    }   
    // 3. 새로운 액세스 토큰 생성
    const newacesstoken = generateAcessToken(
        {
              userid :payload.userid,
            email: payload.email,
            role: payload.role,  
        });
        //4. acess토큰를 쿠키로 저장
      const response = NextResponse.json(
      { success: true, AcessToken: newacesstoken});
      
      response.cookies.set('access-token', newacesstoken,{
        httpOnly:true,
        maxAge:60*15,
      })
      return response;
}