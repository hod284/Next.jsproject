'use client'

import { useEffect, useState } from "react";
import {  userApi } from "@/lib/api";
import type { DbUser } from "@/types";

export default function UsersPage()
{
     const [users,setUsers] = useState<DbUser[]>([]);
     const [isLoading,setIsLoading] = useState(true);
     const [error,setError] =useState('');
     const [roleFilter,setRoleFilter] =useState<string>('all');
     
     useEffect(()=>{
        fetchUsers();
     },[roleFilter]);
     const  fetchUsers = async()=>{
         try
         {
            setIsLoading(true);
            const response = await userApi.getAll(roleFilter === 'all'? undefined :roleFilter);
            if(response.success&&response.data)
            {
                setUsers(response.data);
            }
            else
            {
                setError('사용지 조회 실패');
            }
         }
         catch(error)
         {
            setError(error instanceof Error ?error.message:'사용자 조회 실패');
         }
         finally
         {
               setIsLoading(false);
         }
     };
     const handleDelete =async(email :string) =>{
        if(!confirm('정말 삭제하시겠습니까?'))
            return;
        try
        {
          const response = await userApi.delete(email);
          if(response.success)
          {
            alert('삭제되었습니다');
           fetchUsers();  
          }
          else
          {
             alert('삭제 실패');
          }
        }
        catch(error)
        {
                  alert(error instanceof Error ? error.message : '삭제 실패');
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
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600 mt-2">전체 {users.length}명</p>
        </div>
        
        {/* 역할 필터 */}
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="관리자">관리자</option>
            <option value="사용자">사용자</option>
          </select>
        </div>
      </div>

      {/* 사용자 테이블 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">이름</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">이메일</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">역할</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">가입일</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    사용자가 없습니다
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-6 text-sm text-gray-900">{user.id}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === '관리자' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete(user.email)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
     
}