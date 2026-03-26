"use client";

import { Trophy, Flame, Target } from "lucide-react";       // icon
import ActivityHeatmap from "@/components/ActivityHeatmap";           // Component hiện lịch sử học tập 30 ngày

interface UserStatsPanelProps {
    userStats: {
        testsTaken: number;
        highestScore: number;
    };
    userResults: any[];
}

export default function UserStatsPanel({ userStats, userResults }: UserStatsPanelProps) {
    return (
        <section className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Trophy className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Highest Score</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {userStats.highestScore > 0 ? userStats.highestScore : "—"}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-center">
                    <div className="flex items-center mb-2">
                        <div className="bg-orange-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
                            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-slate-500">Activity (30 Days)</p>
                        </div>
                    </div>
                    <div className="w-full mt-auto">
                        {userResults.length > 0 ? (
                            <ActivityHeatmap results={userResults} />
                        ) : (
                            <p className="text-[10px] text-slate-400 mt-2 text-center">Complete a test to see activity.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center">
                    <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                        <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Tests Completed</p>
                        <p className="text-2xl font-bold text-slate-900">{userStats.testsTaken}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}