import { NextResponse  } from "next/server";
import {query ,isPostgresError} from '@/lib/db'
import { hashPassword ,validdatePassword } from "@/lib/password";
import type { RegisterRequest,AuthResponse } from "@/types";


export async function  POST(request:Request) {
    try
    {
       const body = await request.json() as RegisterRequest;
       const {name,email,password, role}= body;
       // 유효성 검사
       if(!name||!email||!password)
       {
           return NextResponse.json(
            {success : false, error : '이름이나 이메일이나 패스워드를 입력하세요'} as AuthResponse,
            {status : 400}
           );
       }
       //이메일 형식 검증 
       const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if(!emailRegex.test(email))
       {
        return NextResponse.json(
           {success :false, error: '이메일 형식이 잘못되었습니다.'} as AuthResponse,
           {status :400} 
        );
       }
       // 비밀번호 유효성 검증
       const passwordvaild = validdatePassword(password);
       if(!passwordvaild.valid)
       {
        return NextResponse.json(
             {success: false ,error : passwordvaild.error},
             {status :400}
        );
       }
       //비밀번호 해싱
       const passwordhasing =await hashPassword(password);
       // db에 사용자 저장
       const result = await query(`
        INSERT INTO users(name, email,password,role,status,joined)
        VALUES($1,$2,$3,$4,$5,NOW())
        RETURNING id,name,email,role,status,joined`,[name,email,passwordhasing,role||'사용자','활성']);
        const user = result.rows[0];
        return NextResponse.json(
            {success: true , user :{  
                id :user.id,
                name : user.name,
                email: user.email,
                role: user.role
            }} as AuthResponse ,{status :200}
        );
    }
    catch(error)
    {
        console.error("회원가입 에러:",error);
        if(isPostgresError(error)&&error.code === '23505')
        {
              return NextResponse.json(
                {success :false , error: '이미 존재하는 이메일입니다'} as AuthResponse,
                {status : 409}
              )     
        }
        return NextResponse.json(
            {success : false ,error: '회원가입에 실패 했습니다'},
             {status :500}
        )
    }
}