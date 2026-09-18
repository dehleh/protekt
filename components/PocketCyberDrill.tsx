'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { SupportedLanguage } from '../lib/vernacular';
import { DrillScenario, DRILL_SCENARIOS } from '../lib/pocket-drill';

export { DRILL_SCENARIOS };
export type { DrillScenario };

interface PocketCyberDrillProps {
  language?: SupportedLanguage;
}

export function PocketCyberDrill({ language = 'English' }: PocketCyberDrillProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const scenario = DRILL_SCENARIOS[currentIndex];

  const handleSelect = (isCorrect: boolean) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(isCorrect);
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setCurrentIndex((prev) => (prev + 1) % DRILL_SCENARIOS.length);
  };

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl text-white mt-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            ⚡
          </span>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              30-Second Street-Smart Cyber Drill
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                {scenario.tag}
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Build scam defense muscle memory in 1 tap · Scenario {currentIndex + 1} of {DRILL_SCENARIOS.length}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-emerald-400">{score} Points</span>
        </div>
      </div>

      {/* Scenario Question */}
      <div className="my-4">
        <p className="text-xs sm:text-sm font-medium text-neutral-200 leading-relaxed bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
          &quot;{scenario.question}&quot;
        </p>
      </div>

      {/* 2-Choice 1-Tap Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {scenario.options.map((opt, idx) => {
          let btnClass = 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700';

          if (selectedAnswer !== null) {
            if (opt.isCorrect) {
              btnClass = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
            } else {
              btnClass = 'bg-red-950/40 border-red-900 text-neutral-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt.isCorrect)}
              disabled={selectedAnswer !== null}
              className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between gap-2 active:scale-98 ${btnClass}`}
            >
              <span>{opt.text}</span>
              {selectedAnswer !== null && opt.isCorrect && (
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Street-Smart Explanation */}
      {selectedAnswer !== null && (
        <div
          className={`mt-3.5 p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
            selectedAnswer
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/30 border-red-500/40 text-red-200'
          }`}
        >
          <div className="font-bold flex items-center gap-1.5 mb-1">
            {selectedAnswer ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>CORRECT! Street-Smart Move.</span>
              </>
            ) : (
              <>
                <AlertTriangle size={15} className="text-red-400" />
                <span>TRAP DETECTED! Don&apos;t fall for this format.</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-neutral-300">
            {language === 'Pidgin assist' ? scenario.explanationPidgin : scenario.explanationEn}
          </p>

          <div className="mt-2.5 flex justify-end">
            <button
              onClick={handleNext}
              className="py-1 px-3 rounded-lg bg-white hover:bg-neutral-200 text-neutral-900 text-[11px] font-bold flex items-center gap-1 transition"
            >
              <span>Next Quick Drill</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
