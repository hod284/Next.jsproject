// "use client"; 쓰는 이유는 useEffect,useState  가 서버 컴포넌트에 못쓰기 때문에 클라이언트 단이라고 명시해주는 거임
"use client";
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useEffect,useState } from "react";
import { statsApi } from "@/lib/api";
import type { DashboardStats } from "@/types";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
                setstats(response.data as DashboardStats);
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
  
  // 차트 데이터 변환
  const monthlyChartData = stats.monthlysales.map(item => ({
    month: item.month,
    매출: parseFloat(item.total_sales)
  }));

  const categoryChartData = stats.category.map(item => ({
    category: item.category,
    매출: parseFloat(item.total_sales),
    주문수: parseInt(item.order_count)
  }));
 return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-2">비즈니스 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 총 매출 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">총 매출</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalsales}원</p>
              <p className="text-sm text-green-600 mt-2">{stats.saleschange}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* 총 사용자 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">총 사용자</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totaluser.toLocaleString()}명</p>
              <p className="text-sm text-gray-500 mt-2">가입 회원</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        {/* 총 주문 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">총 주문</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalorders.toLocaleString()}건</p>
              <p className="text-sm text-gray-500 mt-2">누적 주문</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        {/* 평균 주문액 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">평균 주문액</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(parseFloat(stats.totalsales.replace(/,/g, '')) / stats.totalorders).toLocaleString()}원
              </p>
              <p className="text-sm text-gray-500 mt-2">건당 평균</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* 월별 매출 라인 차트 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">월별 매출 추이</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
               <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              formatter={(value: number|undefined) => value?.toLocaleString()??'0'+'원'}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="매출" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 카테고리별 매출 바 차트 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">카테고리별 매출</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryChartData}>
            <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="category" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              formatter={(value: number|undefined) => value?.toLocaleString()??'0' + (typeof value === 'number' && value > 1000 ? '원' : '건')}
            />
            <Legend />
            <Bar dataKey="매출" fill="#10b981" />
            <Bar dataKey="주문수" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 월별 매출 테이블 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">월별 매출 상세</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">월</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">매출</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlysales.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{item.month}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                    {parseFloat(item.total_sales).toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 카테고리별 매출 테이블 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">카테고리별 매출 상세</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">카테고리</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">주문 수</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">매출</th>
              </tr>
            </thead>
            <tbody>
              {stats.category.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">{item.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">
                    {parseInt(item.order_count).toLocaleString()}건
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                    {parseFloat(item.total_sales).toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}