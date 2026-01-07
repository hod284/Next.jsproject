
//lib /api.ts
import type { AuthResponse,ApiResponse,DbUser,DbOrder, DashboardStats} from "@/types";


const API_BASE_URL  = process.env.NEXT_PUBLIC_API_URL||'';


//토큰저장
function saveToken(refreshToken :string)
{
       localStorage.setItem('refreshToken',refreshToken);
}
// 토큰 삭제
function deletetoke()
{
    localStorage.removeItem('refreshToken');
}
//api요청 헬퍼
async function apiRequest<T>(url :string,options: RequestInit ={}): Promise<T>
{  
      const headers: Record<string, string> = {
      'Content-Type': 'application/json',
     };
       // 기존 헤더 복사
       // 객체를 키 값으로 바꾸는 문법Object.entries(options.headers)
    if (options.headers) {
         Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
           headers[key] = value;
           }
       });
      }
       //... 기존 옵션을 복사해서 여기에 덮는다라는 표시
    const response = await fetch(`${API_BASE_URL}${url}`,
    {
            ...options,
            headers,
            credentials :'include',// 쿠키 포함 
    });
    console.log("response:",response);
     // 401 에러(토큰 만료)
     if(response.status === 401)
    {
            //액세스 토큰 갱신 시도
            const refreshed = await refreshAccesstoken();
            if(refreshed)
            {
                //재시도
                return apiRequest(url,options);
            }
            else{
                deletetoke();
                window.location.href ='/login';
                throw new Error('인증이 필요합니다');
            }
    }  
    if(!response.ok)
    {
        const error =await response.json();
        throw new Error(error.error||'요청 실패');
    }
    return response.json();
}
// 토큰 갱신
async function refreshAccesstoken() {
    // 1.local에 있는 리프레쉬토큰 가져오기
    const refreshtoken = localStorage.getItem('refreshToken');
        if(!refreshtoken) {
            console.log('❌ RefreshToken 없음');
            return false;
        }
    // 갱신 리스폰 생성
    const response = await fetch('api/auth/refresh',{
        method :'POST',
        body:JSON.stringify({refreshtoken}),
        credentials: 'include',
    })
    return response.ok;
}
// 인증 API
export const authApi ={
      //로그인
      login :async (email: string ,password: string) : Promise<AuthResponse>=>{
           const response = await apiRequest<AuthResponse>('/api/auth/login',{
            method :'POST',
            headers: {'Content-Type': 'application/json'},
            body : JSON.stringify({email,password}), 
        });
            console.log('✅ 포스트 전송');
           if(response.success && response.refreshToken)
           {
            saveToken(response.refreshToken);
             console.log('✅ 토큰 저장 완료');
           }
           return response;  
      },
      //회원 가입
      register: async(name : string,email:string , password :string): Promise<AuthResponse>=>
      {
        const response = await apiRequest<AuthResponse>('/api/auth/register',{
            method:'POST',
            body:JSON.stringify({name,email,password}),
        });
        return response;
      },
      // 로그아웃
      LogOut: async(): Promise<void> =>{
       await apiRequest('/api/auth/logout',{method:'POST'});
       deletetoke();
       window.location.href ='/login';
      },
      //현재 사용자 정보
      me:async(): Promise<AuthResponse> =>
      {
        return apiRequest<AuthResponse>('api/auth/me');
      },
};

// 사용자 api
export const userApi ={
    // 모든 사용자 조회
    getAll :async (role?: string): Promise<ApiResponse<DbUser[]>> =>{
        const url = role? `/api/user?role =${role}`:'/api/users';
        return apiRequest<ApiResponse<DbUser[]>>(url);
    },
    // 사용자 생성
    create: async(user:Partial<DbUser>):Promise<ApiResponse<DbUser>> =>
    {
         return apiRequest<ApiResponse<DbUser>>('/api/users',{
            method:'POST',
            body:JSON.stringify(user),
         });
    },
    // 사용자 수정
    update: async(user:DbUser):Promise<ApiResponse<DbUser>> =>
    {
        return apiRequest<ApiResponse<DbUser>>('/api/users', {
             method:'PUT',
             body:JSON.stringify(user),
        });
    },
    // 사용자 삭제
    delete:async (email:string):Promise<ApiResponse<null>>=> {
        return  apiRequest<ApiResponse<null>>(`/api/users?email =${email}`,{method: 'DELETE',});
    },
}
//주문 API
export const orderApi ={
    // 모든 주문 조회
    getAll :async (status?:string, limit?:number) :Promise<ApiResponse<DbOrder[]>>=>{
        const params = new URLSearchParams();
        if(status)
        params.append('status',status);
        if(limit)
            params.append('limit',limit.toString());
        const url = `/api/orders/${params.toString()}`? `?${params.toString()}`: ``;
        return apiRequest<ApiResponse<DbOrder[]>>(url);

    },
    // 주문생성
    createOrder : async(order : Partial<DbOrder>):Promise<ApiResponse<DbOrder>> =>{
        return apiRequest<ApiResponse<DbOrder>>(`/api/orders`,{
            method:'POST',
            body:JSON.stringify(order),
        });
    },
    //주문 수정
    orderpath : async(order :DbOrder) :Promise <ApiResponse<DbOrder>>=>{
        return apiRequest<ApiResponse<DbOrder>>('api/orders',{
            method:'PUT',
            body: JSON.stringify(order),
        });
    },
};
//통계api
export const statsApi ={
    //대쉬보드 통계
    getDashbord :async(): Promise <ApiResponse<DashboardStats>>=>{
        return apiRequest<ApiResponse<DashboardStats>>(`api/stats`);
    },
};