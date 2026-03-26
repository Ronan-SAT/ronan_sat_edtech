"use client";

import { Medal } from "lucide-react";       // icon

interface LeaderboardTableProps {
    leaderboard: any[];
}

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
    return (
        <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-yellow-100 p-2 rounded-lg">
                    <Medal className="w-5 h-5 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Weekly Top Achievers (Số bài test đạt cao hơn 1450)</h2>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-bold w-24">Rank</th>
                                <th className="px-6 py-4 font-bold">Student Name</th>
                                <th className="px-6 py-4 font-bold text-center">Tests Completed</th>
                                <th className="px-6 py-4 font-bold text-center">Highest Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                                        Chưa có học sinh nào đạt được bài test cao hơn 1450 điểm trong tuần này.
                                    </td>
                                </tr>
                            ) : (
                                leaderboard.map((student, index) => (
                                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold">
                                            {/* Hiệu ứng Top 1 2 3 sẽ có icon cúp, còn lại là số bình thường */}
                                            {index === 0 ? <span className="text-yellow-500 text-xl" title="Top 1">🥇 1</span> : 
                                             index === 1 ? <span className="text-slate-400 text-xl" title="Top 2">🥈 2</span> : 
                                             index === 2 ? <span className="text-amber-600 text-xl" title="Top 3">🥉 3</span> : 
                                             <span className="text-slate-500 ml-1">#{index + 1}</span>}
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