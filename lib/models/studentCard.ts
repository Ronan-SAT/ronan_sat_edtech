import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
    name: string;
    school: string;
    score: number;
    examDate: string;
    imageUrl: string;
}

const StudentSchema: Schema<IStudent> = new Schema(
    {
        name: { type: String, required: true },
        school: { type: String, required: true },
        score: { type: Number, required: true },
        examDate: { type: String, required: true },
        imageUrl: { type: String, required: true },
    },
    { timestamps: true } 
);

const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
export default Student;