import { Target } from "lucide-react";
import React from "react";
import { DomainStat } from "./reviewPage.utils";

export function SkillPerformanceCard({ data }: { data: DomainStat[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="rounded-lg bg-rose-100 p-1.5 flex items-center justify-center">
          <Target className="h-5 w-5 text-rose-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Skill Analysis</h2>
      </div>

      <div className="space-y-6">
        {data.map((domainObj) => (
          <div key={domainObj.domain} className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">{domainObj.domain}</h3>
            <div className="space-y-5 pl-2">
              {domainObj.skills.map((skill) => {
                const mistakeCount = skill.wrong + skill.omitted;
                const errorRate = skill.total > 0 ? mistakeCount / skill.total : 0;
                const isHighError = errorRate > 0.5;

                let indicatorColor = "bg-gray-400";
                if (isHighError) indicatorColor = "bg-red-500";
                else if (mistakeCount === 0) indicatorColor = "bg-emerald-500";
                else indicatorColor = "bg-amber-400";

                return (
                  <div key={skill.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700">{skill.name}</span>
                      <span className="text-xs font-semibold text-gray-500">
                        {mistakeCount} Wrong / {skill.total} Total
                      </span>
                    </div>
                    {/* Progress Bar Container - Shows Mistake Rate */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${indicatorColor}`}
                        style={{ width: `${errorRate * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
