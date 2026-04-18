"use client";

import React, { useState, useEffect } from 'react';

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("Optimizing prompt with Gemini flash...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 95) return p;

        const next = p + 2;
        if (next > 30 && next < 60) setStep("Generating beautiful imagery...");
        if (next >= 60) setStep("Rendering regional scripts accurately...");

        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>{step}</span>
        <span>{Math.floor(progress)}%</span>
      </div>
      <div className="w-full bg-black/40 rounded-full h-2 min-h-[8px] overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 min-h-[8px] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
