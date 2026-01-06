'use client'

import { useEffect, useState } from "react";
import {  orderApi } from "@/lib/api";
import type { DbOrder } from "@/types";

export default function OrdersPage()
{
    const [orders,setOrders] =useState<DbOrder[]>([]);
    const [isLoading ,setIsLoading] =useState(true);
    const [error,setError] =useState('');
    const [statusFilter,setStatusFilter] =useState<string>('all');
    useEffect(() =>{
            fetchOrder();
          },[statusFilter]);
    const   fetchOrder = async()=>{
        try
        {
            setIsLoading(true);
             const response = await orderApi.getAll(
                statusFilter === 'all' ? undefined: statusFilter,100
             );
             if(response.success&&response.data)
             {
                   setOrders(response.data);
             }
             else
              {
                setError('주문조회 실패');
              }
        }
        catch(err)
        {
            setError(err instanceof Error ?err.message:'주문조회 실패');
        }
        finally
        {
            setIsLoading(false);
        }
    };
    const getStatusColor  =(status :string) =>{
     switch (status) {
      case '처리중':
        return 'bg-yellow-100 text-yellow-800';
      case '배송중':
        return 'bg-blue-100 text-blue-800';
      case '완료':
        return 'bg-green-100 text-green-800';
      case '취소':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
 return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
          <p className="text-gray-600 mt-2">전체 {orders.length}건</p>
        </div>
        
        {/* 상태 필터 */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="처리중">처리중</option>
            <option value="배송중">배송중</option>
            <option value="완료">완료</option>
            <option value="취소">취소</option>
          </select>
        </div>
      </div>

      {/* 주문 테이블 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">주문번호</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">사용자 ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">제품</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">금액</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">상태</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">주문일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    주문이 없습니다
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      #{order.order_number}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{order.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{order.product}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 text-right">
                      {order.amount?.toLocaleString()}원
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {order.order_date ? new Date(order.order_date).toLocaleDateString('ko-KR') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-800 font-medium">처리중</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {orders.filter(o => o.status === '처리중').length}건
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">배송중</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {orders.filter(o => o.status === '배송중').length}건
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-800 font-medium">완료</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {orders.filter(o => o.status === '완료').length}건
          </p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-800 font-medium">취소</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {orders.filter(o => o.status === '취소').length}건
          </p>
        </div>
      </div>
    </div>
  );
}