"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Trophy, CheckCircle, Save, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

export default function CreateStudentForm() {
    // Thẻ học sinh
    const [studentForm, setStudentForm] = useState({
        name: "",
        school: "",
        score: 0,
        examDate: "",
        imageUrl: ""
    });
    const [studentMessage, setStudentMessage] = useState("");

    // Hàm xử lý khi bấm lưu Học sinh
    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setStudentMessage("");

        if (!studentForm.imageUrl) {
            setStudentMessage("Lỗi: Bạn chưa tải ảnh học sinh lên!");
            return;
        }

        try {
            // Gửi dữ liệu vào API sinh ra ở bài trước
            const res = await api.post("/api/students", studentForm);

            if (res.status === 200 || res.status === 201) {
                setStudentMessage("Đã thêm học sinh vào bảng vàng thành công!");
                // Xóa form để nhập em tiếp theo
                setStudentForm({ name: "", school: "", score: 0, examDate: "", imageUrl: "" });
            } else {
                setStudentMessage(`Lỗi: ${res.data?.error || "Không thể thêm học sinh"}`);
            }
        } catch (err: any) {
            console.error(err);
            setStudentMessage("Lỗi kết nối tới máy chủ.");
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-8">
            <div className="p-5 border-b border-slate-200 bg-slate-100 flex items-center gap-2 text-slate-800 font-bold">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Step 3: Add Students to Hall of Fame
            </div>

            <form className="p-6 space-y-6" onSubmit={handleCreateStudent}>
                {studentMessage && (
                    <div className={`p-4 rounded-lg font-medium text-sm flex items-center gap-2 ${studentMessage.includes('thành công') ? 'bg-green-50 justify-center text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {studentMessage.includes('thành công') && <CheckCircle className="w-5 h-5" />}
                        {studentMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cột trái: Điền thông tin chữ */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên học sinh *</label>
                            <input
                                type="text" required
                                value={studentForm.name}
                                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                                placeholder="VD: Nguyễn Văn A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Trường học *</label>
                            <input
                                type="text" required
                                value={studentForm.school}
                                onChange={(e) => setStudentForm({ ...studentForm, school: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                                placeholder="VD: THPT Chuyên Hà Nội - Amsterdam"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Điểm SAT *</label>
                                <input
                                    type="number" required min="400" max="1600"
                                    value={Number.isNaN(studentForm.score) ? "" : studentForm.score}
                                    onChange={(e) => setStudentForm({ ...studentForm, score: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                                    placeholder="1500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Tháng/Năm thi *</label>
                                <input
                                    type="text" required
                                    value={studentForm.examDate}
                                    onChange={(e) => setStudentForm({ ...studentForm, examDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                                    placeholder="VD: August 2023"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Khối Upload Ảnh Cloudinary */}
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 relative">
                        {studentForm.imageUrl ? (
                            <div className="text-center">
                                {/* Nếu đã có ảnh thì hiện ảnh đó lên cho Admin xem trước */}
                                <img src={studentForm.imageUrl} alt="Preview" className="h-48 object-contain rounded-lg mb-4 mx-auto shadow-sm" />
                                <button 
                                    type="button" 
                                    onClick={() => setStudentForm({...studentForm, imageUrl: ""})} 
                                    className="text-red-600 text-sm font-bold hover:underline"
                                >
                                    Xóa ảnh và Chọn lại
                                </button>
                            </div>
                        ) : (
                            <>
                            {/* @ts-ignore */}
                            <CldUploadWidget     
                                uploadPreset="ronan_sat_edTech"
                                onSuccess={(result: any) => {
                                    // Sau khi Cloudinary tải xong, nó sẽ trả về 1 đường link (secure_url), ta lấy link đó nhét vào biến imageUrl
                                    setStudentForm(prev => ({ ...prev, imageUrl: result.info.secure_url }));                                        }}
                            >
                                {({ open }) => (
                                    <div className="text-center cursor-pointer p-4" onClick={() => open()}>
                                        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <p className="font-bold text-slate-700">Click để chọn ảnh học sinh</p>
                                        <p className="text-xs text-slate-500 mt-2">Được hỗ trợ bởi Cloudinary</p>
                                    </div>
                                )}
                            </CldUploadWidget>
                            </>
                        )}
                        
                    </div>
                                
                </div>

                <div className="pt-6 border-t border-slate-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={!studentForm.imageUrl} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" /> Save Student
                    </button>
                </div>
            </form>
        </div>
    );
}