import { useEffect,useState } from "react";
import { statsApi } from "@/lib/api";
import type { DashboardStats } from "@/types";

export default function DashboardPage()
{
    const [stats ,setstats] = useState<DashboardStats|null>(null);
    const [isLoading,setIsLoading] = useState(true);
    const [error,seterror] =useState('');
    useEffect (() =>{
        fetchstate();
    },[]);
    const fetchstate = async() =>{
        try
        {
            setIsLoading(true);
            const response = await statsApi.getDashbord();
            if(response.success&& response.data)
            {
                setstats(response.data);
            }
            else
            {
                seterror('통계조회 실패');
            }
        }
        catch(err)
        {
            seterror(err instanceof Error ? err.message : '통계 조회 실패');
        }
        finally
        {
            setIsLoading(false);
        }
    };
     if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-gray-600">통계 데이터가 없습니다.</div>
    );
  }

}