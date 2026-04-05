"use client";

import { Medal } from "lucide-react";

interface LeaderboardTableProps {
    leaderboard: Array<{
        _id: string;
        name: string;
        testsCompleted: number;
        highestScore: number;
    }>;
}

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
    return (
        <section className="mb-12">
            <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-yellow-100 p-2">
                    <Medal className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                    Weekly Top Achievers (Students scoring above 1450)
                </h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
                            <tr>
                                <th className="w-24 px-6 py-4 font-bold">Rank</th>
                                <th className="px-6 py-4 font-bold">Student Name</th>
                                <th className="px-6 py-4 text-center font-bold">Tests Completed</th>
                                <th className="px-6 py-4 text-center font-bold">Highest Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center italic text-slate-500">
                                        No students have scored above 1450 this week.
                                    </td>
                                </tr>
                            ) : (
                                leaderboard.map((student, index) => (
                                    <tr key={student._id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-6 py-4 font-semibold">
                                            {index === 0 ? <span className="text-xl text-yellow-500" title="Top 1">🥇 1</span> :
                                             index === 1 ? <span className="text-xl text-slate-400" title="Top 2">🥈 2</span> :
                                             index === 2 ? <span className="text-xl text-amber-600" title="Top 3">🥉 3</span> :
                                             <span className="ml-1 text-slate-500">#{index + 1}</span>}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-600">{student.testsCompleted}</td>
                                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{student.highestScore}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
