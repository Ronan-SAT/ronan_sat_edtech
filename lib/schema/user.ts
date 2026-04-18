import { z } from "zod";
import {
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
    isValidBirthDate,
} from "@/lib/userProfile";

export const UserValidationSchema = z.object({
    name: z.string().optional(),
    username: z
        .string()
        .min(USERNAME_MIN_LENGTH)
        .max(USERNAME_MAX_LENGTH)
        .regex(/^[a-z0-9_]+$/)
        .optional(),
    birthDate: z
        .string()
        .refine(isValidBirthDate, "Birthdate must be a valid YYYY-MM-DD value")
        .optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    role: z.enum(["STUDENT", "PARENT", "ADMIN"]).default("STUDENT"),
    testsTaken: z.array(z.string()).optional(),
    highestScore: z.number().min(0).default(0),
    lastTestDate: z.date().optional(),
    wrongQuestions: z.array(z.string()).optional(),
    resetPasswordToken: z.string().optional(),
    resetPasswordExpires: z.date().optional(),
});

export type UserInput = z.infer<typeof UserValidationSchema>;
