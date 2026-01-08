
import {  NextResponse } from "next/server";
import {query} from'@/lib/db'
import type { ApiResponse,DashboardStats } from "@/types";


export async function  GET() {
    try
    {
        // 총 주문 건수
        const total_order_count = await query(`SELECT COUNT(*) as total_orders FROM orders`);
       // 총매출
       //COALESCE 인자들중 null이 아닌값만 출력한다
       const total_orders =await query(`SELECT COALESCE(SUM(amount),0) as total_orders FROM orders `);
       // 총사용자
       const total_users =  await query(`SELECT COUNT(*)  as total_users FROM users WHERE status = '활성'`);
       // 이번달 매출
       // EXTRACT() 데이트 타입에서 특정 부분 추출하는 함수
       const thismonthsales = await query(`SELECT COALESCE(SUM(amount),0)as month_sales,COUNT(*) as order_count
                                           FROM orders 
                                           WHERE EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM NOW()) 
                                           AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM NOW())`);
       // 지난달 매출
       const lastmonthsales = await query(`SELECT COALESCE(SUM(amount),0) as month_sales FROM orders
                                            WHERE EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM NOW() - INTERVAL '1month')
                                            AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM NOW()) 
                                            `);                                   
       // 월별 매출 추이
       const monthly_sales = await query(`SELECT TO_CHAR(order_date,'YYY-MM')as month,SUM(amount) as sales, COUNT(*)
                                          FROM orders
                                          WHERE order_date >= NOW() -INTERVAL '6month' 
                                          GROUP BY  TO_CHAR(order_date,'YYY-MM')
                                          ORDER BY month DESC
                                          LIMIT 6`);
       //카테고리 별로 주문
       const categorystate = await query(`SELECT CASE 
                                             WHEN product LIKE '%폰%' OR product LIKE '%워치%' OR product LIKE '%태블릿%' THEN '전자제품'
                                             WHEN product LIKE '%의류%' OR product LIKE '%옷%' THEN '의류'
                                             WHEN product LIKE '%키보드%' OR product LIKE '%마우스%' THEN 'PC부속품'
                                            ELSE '기타'
                                            END as category,
                                            COUNT(*) as count,
                                             COALESCE(SUM(amount), 0) as total_sales
                                            FROM orders
                                            GROUP BY category`);
        // 증가율 계산
        const lastmonth =parseFloat(lastmonthsales.rows[0]?.month_sales || 0);
        const thismonth =parseFloat(thismonthsales.rows[0]?.month_sales || 0);
          const change = lastmonth > 0 
            ? (((thismonth - lastmonth) / lastmonth) * 100).toFixed(1)
            : '0.0';
        const saleschange = `${parseFloat(change) >= 0 ? '+' : ''}${change}%`;
        
        // ✅ DashboardStats 타입에 맞춤
        const stats: DashboardStats = {
            totalsales: parseFloat(total_orders.rows[0]?.total_sales || '0').toLocaleString('ko-KR'),
            totaluser: parseInt(total_users.rows[0]?.total_users || '0'),
            totalorders: parseInt(total_order_count.rows[0]?.total_orders || '0'),
            saleschange: saleschange,
            monthlysales: monthly_sales.rows.map(row => ({
                month: row.month,
                total_sales: String(row.total_sales || '0')
            })),
            category: categorystate.rows.map(row => ({
                category: row.category,
                total_sales: String(row.total_sales || '0'),
                order_count: String(row.order_count || '0')
            }))
        };
        
        const response: ApiResponse<DashboardStats> = {
            success: true,
            data: stats
        };
        
        return NextResponse.json(response);
    }
    catch(error :unknown)
    {
        console.log("주문통계오류 : ",error);
        return NextResponse.json(
            {success: false , error : '주문 통계오류'},
            {status :500}
        );
    }
}


