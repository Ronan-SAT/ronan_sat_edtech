"use client";

import { useState } from "react";
import api from "@/lib/axios";                 // Quy chuẩn api gửi đi ở dạng JSON
import { API_PATHS } from "@/lib/apiPaths";    // các routes cố định (tránh phải type lại nhiều gây lỗi)
import { Plus, FileText } from "lucide-react";

export default function CreateTestForm({ onSuccess }: { onSuccess: () => void }) {
    // State for Test Creation
    const [testForm, setTestForm] = useState({    // Tạo form cho bài test và có các thông tin mặc định như dưới
        title: "",
        timeLimit: 120,
        difficulty: "medium",
    });

    const [testMessage, setTestMessage] = useState("");  // Hiện thông báo về trạng thái tạo test (Thành công/Thất bại)

    // Hàm xử lý khi ấn nút tạo test, gửi data test tạo lên sẽ mất tgian => use async
    const handleCreateTest = async (e: React.FormEvent) => {   // Khi user thực hiện any hành động trên web, trình duyệt gửi mọi data về hành động đó qua e (event)
                                                               // FormEvent thể hiện đây là sự kiện dành cho Form chứ k phải Cuộn/Kích chuột
        e.preventDefault();
        setTestMessage("");   // Xóa trắng các thông báo cũ (các thông báo lỗi cũ) trước khi tạo test mới

        try {
            const res = await api.post(API_PATHS.TESTS, {
                ...testForm,                                     // ... tổng hợp toàn bộ data đã gửi vào form cho bài test cụ thể này 
                sections: [                                      // Đính thêm 2 phần thông tin cố định, k cần user type vào form
                    { name: "Reading and Writing", questionsCount: 27, timeLimit: 32 },
                    { name: "Math", questionsCount: 22, timeLimit: 35 }
                ]
            });

            if (res.status === 200 || res.status === 201) {
                setTestMessage("Test created successfully!");    // api.post thực hiện thành công việc gửi data từ FE về BE
                setTestForm({ title: "", timeLimit: 120, difficulty: "medium" });     // Tạo thành công thì reset các thông số kia về như cũ để tạo tiếp
                onSuccess();                                                          // Refresh lại trang giúp web vừa tạo hiện ra màn hình 
            } else {
                setTestMessage(`Error: ${res.data.error || "Error creating test."}`);  
            }
        } catch (err: any) {      // err: any -> Lỗi ở đây có thể là bất kỳ loại data nào
            console.error(err);
            setTestMessage("Network error");
        }
    };

    return (
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-100 flex items-center gap-2 text-slate-800 font-bold">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Step 1: Create Test
                </div>

                <form className="p-5 space-y-5" onSubmit={handleCreateTest}>
                    {testMessage && (
                        <div className={`p-3 rounded-lg font-medium text-sm ${testMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {testMessage}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Test Title</label>   
                        <input                               // Cập nhật tên (title) cho bài test
                            type="text" 
                            required
                            value={testForm.title}
                            onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}      // Cập nhật liên tục input từ user vào kho chứa title bài test
                                                                                                        // ...testForm (chứa mọi thông tin về bài test <tên, timelimit, độ khó>) để các mục còn lại ngoài title không bị xóa mất mỗi khi điền title
                            placeholder="e.g. Official Practice Test 1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Minutes</label>
                            <input                                                // update timelimit của bài test đang đc tạo
                                type="number"
                                required
                                value={Number.isNaN(testForm.timeLimit) ? "" : testForm.timeLimit}     // nếu timeLimit hiện tại của bài test đang không phải 1 con số (NaN = not a number) thì hiện ô trống không, còn có là số thì mới hiện
                                onChange={(e) => setTestForm({ ...testForm, timeLimit: parseInt(e.target.value) })}   // parseInt để ép data thành 1 con số trước khi vào bộ nhớ 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty</label>
                            <select
                                value={testForm.difficulty}
                                onChange={(e) => setTestForm({ ...testForm, difficulty: e.target.value })}      // độ khó là each option dưới, giá trị được chọn truyền vào e.target.value
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex justify-center items-center gap-2 font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" /> Create Test    {/* Plus là icon dấu cộng cho đẹp thôi */}
                    </button> 
                </form>
            </div>
        </div>
    );
}