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
  joined: Date;
  created_at?: Date;
  updated_at?: Date;
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

