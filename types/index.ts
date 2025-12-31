// 타입 스크립트는 인터페이스를 고랭에서따왔기 때문에 c#의 구조체 덩어리 처럼 보인다
//사용자 타입
export interface User
{
    id : number;
    name : string;
    email : string;
    role : '관리자' | '편집자' |'사용자';
    status : '활성' | '바활성';
    joined:string;
}
//주문 타입
export interface Order 
{ 
     id : string;
     customer : string;
     product : string;
     amount : string;
     status: '완료' |'배송중' | '처리중'
     date: string;
}
//통계타입
export interface Stats  
{
  title : string;
  value: string;
  change : string;
}
//매출데이터 타입
export interface SalesData
{
   month : string;
   sales : number;
   orders: number;
}
//카테고리 데이터 타입
export interface CategoryData
{
   name :string;
   value : number;
   color: string;
}
//api응답 타입
export interface ApiResponse<T>
{
    success: boolean;
    data? : T;
    error?: string;
}
// 데이터베이스 사용자 타입 (DB 스키마용)
export interface DbUser {
  id?: number;
  name: string;
  email: string;
  role: string;
  status: string;
  password? : string;// 로그인용 (응답에서는 제외) ? 이게 들어가 있는거는 있어도 되고 없어도 된다는 의미
  joined: Date;
  created_at?: Date;
  updated_at?: Date;
}
// 인증 관련 타입
export interface LoginRequest
{
   email: string;
   password: string;
}
export interface RegisterRequest
{
    name: string;
    email :string;
    password: string;
    role?: string;
}
export interface AuthResponse
{
   success : boolean;
   user? :
   {
       id : number;
       name : string;
       email: string;
       role: string;
   }
   accessToken?: string;
   refreshToken? : string;
   error ?: string;
}
export interface RefreshTokenRequest
{
     refreshToken: string;
}
export interface JwtPayload
{
  userid : number;
  email:string;
  role:string;
  tokenType:'access'|'refresh'
  iat?:number;
  exp?:number;
}
// db refreshtoken 타입
export interface RefreshToken
{
  id? : number;
  user_id :number;
  token:string;
  expires_at :Date;
  created_at?: Date;
  revoked?:boolean;
  revoked_at?:Date;
}

// 데이터베이스 주문 타입 (DB 스키마용)
export interface DbOrder {
  id?: number;
  order_number: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  order_date: Date;
  created_at?: Date;
  updated_at?: Date;
}

