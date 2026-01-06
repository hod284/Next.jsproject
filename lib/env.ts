//: 반환타입
export function getEnv(key: string, defaultValue?: string): string {
  if (typeof window !== 'undefined') {
    // 클라이언트에서는 사용 불가
    throw new Error(`Cannot access ${key} on client side`);
  }
  
  const value = process.env[key];
  
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    // 빌드 시점에는 경고만 출력 (에러 안 냄)
    console.warn(`⚠️  Environment variable ${key} is not set. Using default.`);
    return '';
  }
  
  return value;
}

// 필수 환경변수 (런타임에 체크)
export function getRequiredEnv(key: string): string {
  if (typeof window !== 'undefined') {
    throw new Error(`Cannot access ${key} on client side`);
  }
  
  const value = process.env[key];
  
  if (!value) {
    // 프로덕션에서만 에러
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    console.warn(`⚠️  Required environment variable ${key} is not set`);
    return '';
  }
  
  return value;
}

// 환경변수 상수
export const JWT_SECRET :string = getEnv('JWT_SECRET', '67OGocFzYPwt/QX5Yovh95OxyjIjdQBSH2PGdPsJFyyZrslIsV65Xt3z1q+ntBzAV90ulrG+qsDOcCMvVk0+bg==');
export const ACCESS_TOKEN_EXPIRES_IN: string = getEnv('ACCESS_TOKEN_EXPIRES_IN', '30m');
export const REFRESH_TOKEN_EXPIRES_IN : string = getEnv('REFRESH_TOKEN_EXPIRES_IN', '30d');

// DB 환경변수
export const DB_HOST:string  = getEnv('DB_HOST', 'localhost');
export const DB_PORT:string  = getEnv('DB_PORT', '5432');
export const DB_USER:string = getEnv('DB_USER', 'postgres');
export const DB_PASSWORD:string = getEnv('DB_PASSWORD', 'password');
export const DB_NAME:string = getEnv('DB_NAME', 'admin_db');

export const NODE_ENV :string =getEnv('NODE_ENV','production');