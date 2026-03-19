import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/lib/models/studentCard";

// Hàm GET dùng cho trang Hall of Fame để tải danh sách thẻ học sinh
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "8");
        const skip = (page - 1) * limit;

        const students = await Student.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Student.countDocuments();

        return NextResponse.json({ students, totalPages: Math.ceil(total / limit), currentPage: page });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
    }
}

// Hàm POST dùng cho trang Admin để nhận data tạo học sinh mới
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json(); // Lấy data form (Tên, điểm, ảnh...)
        
        // Kiểm tra xem điền đủ thông tin chưa
        if (!body.name || !body.school || !body.score || !body.examDate || !body.imageUrl) {
            return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
        }

        // Tạo học sinh mới trong DB
        const newStudent = await Student.create(body);
        return NextResponse.json({ message: "Student created successfully", student: newStudent }, { status: 201 });
    } catch (error) {
        console.error("Error creating student:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}