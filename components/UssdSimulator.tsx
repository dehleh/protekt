'use client';

import React, { useState, useEffect } from 'react';

interface UssdSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UssdSimulator({ isOpen, onClose }: UssdSimulatorProps) {
  const [screenText, setScreenText] = useState<string>('DIAL *384*746# TO START');
  const [currentInput, setCurrentInput] = useState<string>('');
  const [historyText, setHistoryText] = useState<string>(''); // e.g. "1*0123456789"
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    if (isOpen && !sessionActive) {
      startSession();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function queryUssd(text: string, currentSession: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession,
          serviceCode: '*384*746#',
          phoneNumber: '+2348000000000',
          text: text,
        }),
      });
      const data = await res.text();
      setLoading(false);

      if (data.startsWith('CON ')) {
        setScreenText(data.replace(/^CON\s*/, ''));
        setSessionActive(true);
        setIsEnding(false);
      } else if (data.startsWith('END ')) {
        setScreenText(data.replace(/^END\s*/, ''));
        setSessionActive(false);
        setIsEnding(true);
      } else {
        setScreenText(data);
      }
    } catch {
      setLoading(false);
      setScreenText('NETWORK ERROR. Check connection.');
      setSessionActive(false);
      setIsEnding(true);
    }
  }

  function startSession() {
    const newSessionId = `ussd_sim_${Date.now()}`;
    setSessionId(newSessionId);
    setHistoryText('');
    setCurrentInput('');
    setIsEnding(false);
    queryUssd('', newSessionId);
  }

  function handleSend() {
    if (!sessionActive || loading) {
      startSession();
      return;
    }

    if (!currentInput.trim()) return;

    const nextText = historyText ? `${historyText}*${currentInput.trim()}` : currentInput.trim();
    setHistoryText(nextText);
    setCurrentInput('');
    queryUssd(nextText, sessionId);
  }

  function handleKeyPress(char: string) {
    if (isEnding) return;
    setCurrentInput((prev) => prev + char);
  }

  function handleBackspace() {
    setCurrentInput((prev) => prev.slice(0, -1));
  }

  function handleEndCall() {
    setSessionActive(false);
    setIsEnding(true);
    setCurrentInput('');
    setScreenText('SESSION CANCELLED.\nDial *384*746# to restart.');
  }

  function runQuickScenario(scenarioText: string) {
    const newSessionId = `ussd_sim_${Date.now()}`;
    setSessionId(newSessionId);
    setHistoryText(scenarioText);
    setCurrentInput('');
    setIsEnding(false);
    queryUssd(scenarioText, newSessionId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-700 shadow-2xl p-5 text-white flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close USSD simulator"
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition"
        >
          ✕
        </button>

        <div className="text-center mb-2">
          <h2 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
            2G Feature Phone Simulator
          </h2>
          <p className="text-[11px] text-neutral-400 font-mono">Gateway Service: *384*746# (Offline Telco)</p>
        </div>

        {/* 1-Tap Quick Scenario Demos */}
        <div className="w-full mb-3">
          <div className="text-[10px] text-neutral-400 font-semibold mb-1 text-center">
            1-TAP FAST DEMOS (No manual keypad entry needed):
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {[
              { label: '🛑 Check Scam Acct', payload: '1*0123456789' },
              { label: '🛑 Check Scam Caller', payload: '2*08000000001' },
              { label: '🇰🇪 M-Pesa SIM Lock', payload: '3*2' },
              { label: '🇬🇭 MTN MoMo Freeze', payload: '3*3' },
              { label: '🇿🇦 Capitec/FNB Freeze', payload: '3*4' },
              { label: '💬 Vernacular Voice', payload: '4' },
            ].map((sc) => (
              <button
                key={sc.payload}
                onClick={() => runQuickScenario(sc.payload)}
                className="text-[10px] py-1 px-2.5 rounded-lg bg-neutral-800 hover:bg-emerald-900/40 text-neutral-300 hover:text-emerald-300 border border-neutral-700 hover:border-emerald-500/50 transition active:scale-95"
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2G Feature Phone Body (Retro Nokia / Itel shape) */}
        <div className="w-full max-w-[280px] bg-neutral-950 rounded-3xl p-4 border-2 border-neutral-700 shadow-inner flex flex-col items-center">
          {/* Earpiece slit */}
          <div className="w-12 h-1 bg-neutral-800 rounded-full mb-3" />

          {/* LCD Screen (Retro Monochrome Amber/Green) */}
          <div className="w-full h-44 rounded-xl bg-[#1c2e22] border-2 border-[#2b4d37] p-3 text-[#52e88a] font-mono text-[11px] leading-snug flex flex-col justify-between shadow-inner overflow-hidden select-none">
            {/* Top status bar */}
            <div className="flex justify-between items-center text-[9px] text-[#3cb56b] border-b border-[#2b4d37] pb-0.5">
              <span>📶 2G GSM</span>
              <span>SHOMAR TELCO</span>
              <span>🔋100%</span>
            </div>

            {/* Screen body */}
            <div className="my-auto whitespace-pre-wrap overflow-y-auto max-h-24 pr-1 scrollbar-thin">
              {loading ? 'PROCESSING USSD...' : screenText}
            </div>

            {/* User typing line */}
            <div className="border-t border-[#2b4d37] pt-1 flex items-center justify-between text-xs">
              <div className="truncate">
                <span className="text-[#3cb56b]">&gt; </span>
                <span className="font-bold text-white tracking-widest">{currentInput}</span>
                <span className="animate-pulse">_</span>
              </div>
              {sessionActive && (
                <span className="text-[9px] text-[#3cb56b] uppercase">CON</span>
              )}
              {isEnding && (
                <span className="text-[9px] text-red-400 uppercase">END</span>
              )}
            </div>
          </div>

          {/* Navigation / Call Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={handleSend}
              className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <span>📞</span> {sessionActive ? 'SEND' : 'CALL'}
            </button>
            <button
              onClick={handleEndCall}
              className="py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <span>🛑</span> END
            </button>
          </div>

          {/* 12-Key Number Pad */}
          <div className="w-full grid grid-cols-3 gap-2 mt-3">
            {[
              { key: '1', sub: '.,' },
              { key: '2', sub: 'ABC' },
              { key: '3', sub: 'DEF' },
              { key: '4', sub: 'GHI' },
              { key: '5', sub: 'JKL' },
              { key: '6', sub: 'MNO' },
              { key: '7', sub: 'PQRS' },
              { key: '8', sub: 'TUV' },
              { key: '9', sub: 'WXYZ' },
              { key: '*', sub: 'USSD' },
              { key: '0', sub: '+' },
              { key: '#', sub: 'SEND' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => handleKeyPress(item.key)}
                className="py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-center active:scale-95 transition shadow-sm"
              >
                <div className="text-sm font-bold text-neutral-100 leading-none">{item.key}</div>
                <div className="text-[8px] text-neutral-500 tracking-tighter mt-0.5">{item.sub}</div>
              </button>
            ))}
          </div>

          {/* Clear / Reset Helper bar */}
          <div className="w-full flex justify-between items-center mt-2.5 px-1 text-[11px]">
            <button
              onClick={handleBackspace}
              className="text-neutral-400 hover:text-neutral-200"
            >
              ⌫ Clear
            </button>
            <button
              onClick={startSession}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              ↺ Restart Dial
            </button>
          </div>
        </div>

        {/* Informative Footer */}
        <div className="mt-3 text-center text-[11px] text-neutral-400 max-w-xs">
          Demonstrates how users with basic 2G phones dial <code className="text-emerald-400">*384*746#</code> over standard cellular GSM to check suspicious account numbers or lock stolen SIMs without data.
        </div>
      </div>
    </div>
  );
}
