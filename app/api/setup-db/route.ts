import { NextResponse } from "next/server";
import { initDatabase,insertSampleData} from '@/lib/db'

export async function  POST() {
    try
    {
 console.log('테이블생성');
    await initDatabase();
 console.log('Database 초기화 시작...');
    await insertSampleData();
    
     return NextResponse.json
     (
        {success: true ,message:'db초기화 완료'}
     );
    }
    catch(error)    
    {
        console.error('db초기화 에러:', error );
        return NextResponse.json(
            {success: false , error : error instanceof Error ? error.message : 'Unknown error' },
            {status :500});
    }
}

export async function GET() {
    await POST();
}