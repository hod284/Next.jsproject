import {Pool, PoolClient} from 'pg';
import { DB_USER, DB_HOST,DB_NAME ,DB_PASSWORD,DB_PORT } from './env';
// PostgreSQL 에러 타입 정의
interface PostgresError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}
// PostgreSQL 에러 타입 가드
export function isPostgresError(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}
// postgresql 연결 풀생성
const pool = new Pool({
   user : DB_USER ,
   host : DB_HOST,
   database : DB_NAME ,
   password : DB_PASSWORD,
   port : parseInt(DB_PORT),
   max : 20,
   idleTimeoutMillis :30000,//유효연결 타임 아웃
   connectionTimeoutMillis: 2000. //연결 타임 아웃
});

// 연결 테스트
pool.on('connect',()=>{
    console.log('데이터 베이스 연결 완료');
});
pool.on ('error',(err)=>{ console.log(err);
});
export type QueryParams =(string | number |boolean|null|Date)[];
//쿼리 실행 헬퍼 함수
export const query = async(text: string , params?: QueryParams)=>{
const start= Date.now();
try
{
    const res = await pool.query(text,params);
    const duration = Date.now()-start;
    console.log('쿼리 실행:',{text,duration,rows: res.rowCount});
    return res;
}
catch (error)
{
console.error('쿼리 에러:',error);
throw error;
}
};
/**
 * 트랜잭션 실행 헬퍼
 * @param callback - 트랜잭션 내에서 실행할 함수
 * @returns 콜백 함수의 반환값
 * @example
 * await transaction(async (client) => {
 *   await client.query('INSERT INTO users ...');
 *   await client.query('INSERT INTO refresh_tokens ...');
 * });
 */
export async function transaction<T>(callback : (client :PoolClient ) =>Promise<T>):Promise<T>
{
  const client =await pool.connect();
  try
  {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
  }
  catch(error)
  {
    await client.query('ROLLBACK');
    throw error;
  }
  finally 
  {
    client.release();
  }
}

//이밑으로는 만약 db에 데이터가 있을경우 필요가 없음 샘풀데이터를 넣기 위해 필요함
//데이터 베이스 초기화 (테이블 생성)
export const initDatabase = async ()=>{
     try{
        //created_at TIMESTAMP DEFAULT NOW(), 자동으로 생성 시간 등록
        //updated_at TIMESTAMP DEFAULT NOW()  자동으로 업데이트 시간 등록
      // Users 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT '사용자',
        status VARCHAR(50) NOT NULL DEFAULT '활성',
        joined TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Orders 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer VARCHAR(100) NOT NULL,
        product VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT '처리중',
        order_date TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Stats 테이블 (일별 통계)
    await query(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id SERIAL PRIMARY KEY,
        stat_date DATE UNIQUE NOT NULL,
        total_sales NUMERIC(12, 2) DEFAULT 0,
        total_orders INTEGER DEFAULT 0,
        total_users INTEGER DEFAULT 0,
        conversion_rate NUMERIC(5, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    // refresh_tokens 테이블 구조
    await query(`
       CREATE TABLE IF NOT EXISTS refresh_tokens (
       id SERIAL PRIMARY KEY,
       user_id  INTEGER REFERENCES users(id),
       token VARCHAR(500),
       expires_at TIMESTAMP,
       created_at TIMESTAMP,
       revoked BOOLEAN,
       revoked_at TIMESTAMP
       )
     `);
    // 만료된 토큰 자동 삭제를 위한 인덱스
    await query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
      ON refresh_tokens(user_id)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at 
      ON refresh_tokens(expires_at)
    `);
    console.log(' 데이터베이스 테이블 생성 완료');
  } catch (error) {
    console.error(' 테이블 생성 에러:', error);
    throw error;
  } 
};
// 샘플 데이터 삽입(테이블에 데이터 없을 경우)
export const insertSampleData = async () => {
  try {
    // 샘플 사용자 데이터
    const users = [
      { name: '정윤수', email: 'minsu@example.com',password : "password123"  ,role: '관리자', status: '활성' },
      { name: '이지은', email: 'jieun@example.com',password : "password123" ,role: '편집자', status: '활성' },
      { name: '박서준', email: 'seojun@example.com',password : "password123" ,role: '사용자', status: '활성' },
      { name: '정수아', email: 'sua@example.com', password : "password123",role: '사용자', status: '비활성' },
      { name: '최동훈', email: 'donghoon@example.com',password : "password123" ,role: '편집자', status: '활성' },
    ];

    for (const user of users) {
      await query(
        `INSERT INTO users (name, email, password ,role, status, joined) 
         VALUES ($1, $2, $3, $4,$5 ,NOW()) 
         ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email,user.password ,user.role, user.status]
      );
    }

    // 샘플 주문 데이터
    const orders = [
      { order_number: '#ORD-2501', customer: '김민수', product: '무선 이어폰', amount: 129000, status: '배송중' },
      { order_number: '#ORD-2500', customer: '이지은', product: '스마트 워치', amount: 349000, status: '완료' },
      { order_number: '#ORD-2499', customer: '박서준', product: '노트북', amount: 1290000, status: '처리중' },
      { order_number: '#ORD-2498', customer: '정수아', product: '태블릿', amount: 590000, status: '배송중' },
      { order_number: '#ORD-2497', customer: '최동훈', product: '키보드', amount: 189000, status: '완료' },
    ];

    for (const order of orders) {
      await query(
        `INSERT INTO orders (order_number, customer, product, amount, status, order_date) 
         VALUES ($1, $2, $3, $4, $5, NOW()) 
         ON CONFLICT (order_number) DO NOTHING`,
        [order.order_number, order.customer, order.product, order.amount, order.status]
      );
    }

    console.log('샘플 데이터 삽입 완료');
  } catch (error) {
    console.error('샘플 데이터 삽입 에러:', error);
    throw error;
  }
};