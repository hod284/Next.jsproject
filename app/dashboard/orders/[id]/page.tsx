'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orderApi } from "@/lib/api";
import Link from "next/link";
import type { DbOrder } from "@/types";
export default function Editorderpage({params}:{params :Promise<{id:string}>})
{
     const router = useRouter();
      const [order, setOrder] = useState<DbOrder | null>(null);
      const [orderId, setOrderId] = useState<string>('');
      
      const [formData, setFormData] = useState({
          customer: '',
          product: '',
          amount: '',
          status: '처리중'
      });
      
      const [isLoading, setIsLoading] = useState(true);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [error, setError] = useState('');
      
      useEffect(() => {
          const loadParams = async () => {
              const resolvedParams = await params;
              console.log('📍 Params:', resolvedParams);
              setOrderId(resolvedParams.id);
          };
          loadParams();
      }, [params]);
      
      useEffect(() => {
          if (orderId) {
              fetchOrder();
          }
      }, [orderId]);
      
      const fetchOrder = async () => {
          try {
              setIsLoading(true);
              console.log('🔍 주문 조회 시작:', orderId);
              
              const response = await orderApi.getById(orderId);
              console.log('📦 응답:', response);
              
              if(response.success && response.data) {
                  setOrder(response.data);
                  
                  // ✅ 확실하게 빈 문자열 보장!
                  setFormData({
                      customer: String(response.data.customer || ''),
                      product: String(response.data.product || ''),
                      amount: String(response.data.amount || ''),
                      status: String(response.data.status || '처리중')
                  });
              } else {
                  setError('주문을 찾을 수 없습니다');
              }
          }
          catch(err) {
              console.error('❌ 조회 에러:', err);
              setError('주문 조회 실패');
          }
          finally {
              setIsLoading(false);
          }
      };
      
      const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setError('');
          setIsSubmitting(true);
          
          try {
              console.log('💾 수정 시작:', formData);
              
              const response = await orderApi.orderpath({
                  order_number: order!.order_number,
                  customer: formData.customer,
                  product: formData.product,
                  amount: parseFloat(formData.amount),
                  status: formData.status,
                  order_date: order!.order_date,
              } as DbOrder);
              
              console.log('✅ 수정 완료:', response);
              
              if(response.success) {
                  router.push('/dashboard/orders');
              } else {
                  setError(response.error || '주문 수정 실패');
              }
          }
          catch(err) {
              console.error('❌ 수정 에러:', err);
              setError(err instanceof Error ? err.message : '주문 수정 실패');
          }
          finally {
              setIsSubmitting(false);
          }
      };
      
      // ✅ 로딩 중이거나 에러가 있으면 폼을 렌더링하지 않음!
      if (isLoading) {
          return (
              <div className="flex items-center justify-center h-64">
                  <div className="text-xl text-gray-600">로딩 중...</div>
              </div>
          );
      }
      
      if (error) {
          return (
              <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                      <Link href="/dashboard/orders">
                          <button className="text-blue-600 hover:text-blue-800 mb-4">
                              ← 목록으로
                          </button>
                      </Link>
                  </div>
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                  </div>
              </div>
          );
      }
      
      // ✅ order가 없으면 렌더링하지 않음!
      if (!order) {
          return (
              <div className="flex items-center justify-center h-64">
                  <div className="text-xl text-gray-600">주문을 찾을 수 없습니다</div>
              </div>
          );
      }
      
      // ✅ 여기서부터는 order와 formData가 확실히 있음!
      return (
          <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                  <Link href="/dashboard/orders">
                      <button className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
                          <span>←</span> 목록으로
                      </button>
                  </Link>
                  <h1 className="text-3xl font-bold text-gray-900">주문 수정</h1>
                  <p className="text-gray-600 mt-2">
                      주문번호: {order.order_number}
                  </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                              고객명 <span className="text-red-500">*</span>
                          </label>
                          <input
                              type="text"
                              value={formData.customer}
                              onChange={(e) => setFormData({...formData, customer: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                              제품명 <span className="text-red-500">*</span>
                          </label>
                          <input
                              type="text"
                              value={formData.product}
                              onChange={(e) => setFormData({...formData, product: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                              금액 <span className="text-red-500">*</span>
                          </label>
                          <input
                              type="number"
                              value={formData.amount}
                              onChange={(e) => setFormData({...formData, amount: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              required
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                              상태
                          </label>
                          <select
                              value={formData.status}
                              onChange={(e) => setFormData({...formData, status: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                              <option value="처리중">처리중</option>
                              <option value="배송중">배송중</option>
                              <option value="완료">완료</option>
                              <option value="취소">취소</option>
                          </select>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                          <Link href="/dashboard/orders" className="flex-1">
                              <button
                                  type="button"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                              >
                                  취소
                              </button>
                          </Link>
                          <button
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {isSubmitting ? '저장 중...' : '저장'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      );
}
