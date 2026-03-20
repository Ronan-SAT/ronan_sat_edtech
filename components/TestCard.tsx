import Link from "next/link";
import { Clock, BookOpen, GraduationCap } from "lucide-react";

interface Test {
    _id: string;
    title: string;
    timeLimit: number;
    difficulty: string;
    sections: any[];
}

// Khai báo thêm các tham số mới cho thẻ TestCard
interface TestCardProps {
    test: Test;
    isSectional?: boolean;         // Có phải đang ở trang Sectional không? (Dấu ? nghĩa là không bắt buộc)
    subjectFilter?: string;        // "reading" hoặc "math"
    userResults?: any[];           // Danh sách điểm để kiểm tra xem đã làm chưa
}

export default function TestCard({ test, isSectional = false, subjectFilter, userResults = [] }: TestCardProps) {
    const totalQuestions = test.sections?.reduce((acc, sec) => acc + sec.questionsCount, 0) || 0;

    // --- LOGIC TÌM ĐIỂM CŨ (Dành riêng cho Sectional) ---
    // Giả định trong database `userResults`, mỗi kết quả lưu: testId, subject, module, score
    // Bạn cần điều chỉnh tên các trường (score, module...) cho khớp với schema Result của bạn.
    const getModuleResult = (moduleNumber: number) => {
        return userResults.find(
            (r) => r.testId === test._id && r.subject === subjectFilter && r.module === moduleNumber
        );
    };

    const mod1Result = isSectional ? getModuleResult(1) : null;
    const mod2Result = isSectional ? getModuleResult(2) : null;

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-200 transition-all group flex flex-col h-full">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700">
                        {test.title}
                    </h3>
                </div>

                <div className="space-y-2 mt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{test.timeLimit} Minutes Total</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-400" />
                        <span>{totalQuestions} Questions</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                {/* NẾU LÀ TRANG SECTIONAL -> HIỂN THỊ 2 NÚT */}
                {isSectional ? (
                    <div className="flex flex-col gap-2">
                        {/* Nút Module 1 */}
                        <Link
                            // Truyền tham số subject và module lên URL để TestEngine đọc được
                            href={`/test/${test._id}?subject=${subjectFilter}&module=1`}
                            className={`block w-full text-center font-medium py-2 px-4 rounded-lg border ${
                                mod1Result ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200" : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {mod1Result ? `Retake Module 1 (Score: ${mod1Result.score})` : "Start Module 1"}
                        </Link>

                        {/* Nút Module 2 */}
                        <Link
                            href={`/test/${test._id}?subject=${subjectFilter}&module=2`}
                            className={`block w-full text-center font-medium py-2 px-4 rounded-lg border ${
                                mod2Result ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200" : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {mod2Result ? `Retake Module 2 (Score: ${mod2Result.score})` : "Start Module 2"}
                        </Link>
                    </div>
                ) : (
                    /* NẾU LÀ TRANG FULL-LENGTH BÌNH THƯỜNG -> HIỂN THỊ 1 NÚT NHƯ CŨ */
                    <Link
                        href={`/test/${test._id}`}
                        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                    >
                        Start Practice
                    </Link>
                )}
            </div>
        </div>
    );
}