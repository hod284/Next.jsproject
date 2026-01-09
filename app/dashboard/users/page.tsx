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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<DbUser | null>(null);
// 폼 데이터
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '사용자',
        status: '활성'
    });

     /*
     use effect 때 [] 이걸 넣어야 하는 이유
useEffect(() => {}) → 렌더링마다 실행

useEffect(() => {}, []) → 처음 한 번만 실행

useEffect(() => {}, [a, b]) → a나 b가 바뀔 때 실행
*/
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
      // 수정 모달 열기
    const handleOpenEditModal = (user: DbUser) => {
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
        });
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    // 모달 닫기
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };
    
    // 수정 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingUser) return;
        
        try {
            const response = await userApi.update({
                ...editingUser,
                ...formData
            });
            
            if (response.success) {
                alert('사용자가 수정되었습니다');
                handleCloseModal();
                fetchUsers();
            }
            else {
                alert('수정 실패');
            }
        }
        catch (error) {
            alert(error instanceof Error ? error.message : '수정 실패');
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
                    <p className="text-gray-600 mt-2">
                        전체 {users.length}명
                        <span className="text-sm text-gray-500 ml-2">
                            (신규 사용자는 회원가입을 통해 추가됩니다)
                        </span>
                    </p>
                </div>
                
                <div className="flex gap-2">
                    {/* 역할 필터 */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">전체</option>
                        <option value="관리자">관리자</option>
                        <option value="편집자">편집자</option>
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
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">상태</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">가입일</th>
                                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500">
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
                                                user.role === '관리자' ? 'bg-purple-100 text-purple-800' :
                                                user.role === '편집자' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                user.status === '활성' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => handleOpenEditModal(user)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3"
                                            >
                                                수정
                                            </button>
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
            
            {/* 수정 모달 */}
            {isModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            사용자 수정
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* 이름 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    이름
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            {/* 이메일 (읽기 전용) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">이메일은 수정할 수 없습니다</p>
                            </div>
                            
                            {/* 역할 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    역할
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="사용자">사용자</option>
                                    <option value="편집자">편집자</option>
                                    <option value="관리자">관리자</option>
                                </select>
                            </div>
                            
                            {/* 상태 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    상태
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="활성">활성</option>
                                    <option value="비활성">비활성</option>
                                </select>
                            </div>
                            
                            {/* 버튼 */}
                            <div className="flex gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    수정
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
     
}