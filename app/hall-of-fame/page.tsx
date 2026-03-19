// File: app/hall-of-fame/page.tsx
"use client";

import { useState, useEffect } from "react";
import StudentCard from "@/components/StudentCard";
import Loading from "@/components/Loading";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";

export default function HallOfFame() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Mỗi khi currentPage thay đổi, hàm này sẽ chạy lại để lấy data mới
    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Gọi API lấy học sinh của trang hiện tại (8 em / 1 trang)
                const res = await api.get(`/api/students?page=${currentPage}&limit=8`);
                setStudents(res.data.students);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu học sinh", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
        // Cuộn lên đầu trang mỗi khi chuyển trang
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Wall of <span className="text-blue-600">Excellence</span></h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">Tự hào vinh danh những gương mặt học sinh xuất sắc đã đạt điểm số SAT ấn tượng.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loading /></div>
                ) : students.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 font-medium">Chưa có dữ liệu học sinh nào.</div>
                ) : (
                    <>
                        {/* Lưới hiển thị các thẻ: Mobile 1 cột, Tablet 2 cột, PC 4 cột */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {students.map((student) => (
                                <StudentCard 
                                    key={student._id}
                                    name={student.name}
                                    school={student.school}
                                    score={student.score}
                                    examDate={student.examDate}
                                    imageUrl={student.imageUrl}
                                />
                            ))}
                        </div>

                        {/* Phân trang (Pagination) */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-6 mt-16">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                
                                <span className="font-semibold text-slate-700">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}