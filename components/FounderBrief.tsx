"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  Terminal, 
  MapPin, 
  Banknote, 
  Cpu, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Constraints } from "@/lib/shared/schemas";

interface FounderBriefProps {
  onComplete: (query: string, constraints: Constraints) => void;
  isProcessing: boolean;
}

export const FounderBrief = ({ onComplete, isProcessing }: FounderBriefProps) => {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [constraints, setConstraints] = useState<Constraints>({
    budget_inr: "₹10 - 50 Lakhs",
    location_tier: "Tier 1",
    founder_background: "",
    tech_stack: [],
    time_to_mvp: "3 months"
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleComplete = () => {
    if (query.length < 5) return;
    onComplete(query, constraints);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded flex items-center justify-center">
          <Terminal className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Venture Intake Protocol</h2>
          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Initialization Phase // Step {step} of 4</p>
        </div>
      </div>

      <div className="war-room-panel p-8 rounded-lg relative overflow-hidden min-h-[400px]">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <span className="text-6xl font-black">0{step}</span>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="terminal-text text-[11px] uppercase font-bold text-accent">Core Mission & Problem Space</label>
              <textarea 
                className="command-input min-h-[160px] max-h-[300px] overflow-y-auto text-lg leading-relaxed scrollbar-hide" 
                placeholder="What deep problem are you solving in Bharat?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="terminal-text text-[11px] uppercase font-bold text-accent">Geography Tier & Location</label>
              <div className="grid grid-cols-3 gap-4">
                {["Tier 1", "Tier 2", "Tier 3"].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setConstraints({ ...constraints, location_tier: t as any })}
                    className={`p-4 border text-center transition-all ${constraints.location_tier === t ? 'border-accent text-accent bg-accent/5' : 'border-white/5 text-zinc-500 hover:border-white/20'}`}
                  >
                    <MapPin className="w-4 h-4 mx-auto mb-2 opacity-50" />
                    <span className="text-[11px] font-bold uppercase">{t}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <label className="terminal-text text-[11px] uppercase font-bold text-zinc-500">Capital Deployment (INR)</label>
              <div className="grid grid-cols-2 gap-4">
                {["₹0 - 10L", "₹10 - 50L", "₹50L - 2Cr", "₹2Cr+"].map((b) => (
                  <button 
                    key={b}
                    onClick={() => setConstraints({ ...constraints, budget_inr: b })}
                    className={`px-4 py-2 border text-[10px] font-bold uppercase transition-all ${constraints.budget_inr === b ? 'border-accent text-accent bg-accent/10' : 'border-white/5 text-zinc-500 hover:border-white/10'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="terminal-text text-[11px] uppercase font-bold text-accent">Technical Infrastructure</label>
              <input 
                className="command-input" 
                placeholder="Next.js, AWS, Flutter..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.currentTarget as HTMLInputElement).value.trim();
                    if (val && !constraints.tech_stack.includes(val)) {
                      setConstraints({ ...constraints, tech_stack: [...constraints.tech_stack, val] });
                      (e.currentTarget as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {constraints.tech_stack.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-zinc-400">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="terminal-text text-[11px] uppercase font-bold text-accent">Founder Background & DPDP Awareness</label>
              <textarea 
                className="command-input min-h-[120px]" 
                placeholder="List your core skills and industry experience..."
                value={constraints.founder_background}
                onChange={(e) => setConstraints({ ...constraints, founder_background: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button 
          onClick={prevStep}
          disabled={step === 1 || isProcessing}
          className="flex items-center gap-2 text-[10px] uppercase font-black text-zinc-600 hover:text-white disabled:opacity-0 transition-all border border-transparent hover:border-white/5 px-4 py-2 rounded"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        
        {step < 4 ? (
          <button 
            onClick={nextStep}
            className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-white/90 transition-all"
          >
            Continue Audit <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={handleComplete}
            disabled={isProcessing || !query || !constraints.founder_background}
            className="flex items-center gap-3 px-10 py-4 bg-accent text-black text-[11px] font-black uppercase tracking-widest hover:bg-accent/90 disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-accent/10"
          >
            {isProcessing ? "Calibrating Sensors..." : "Trigger Strategic Audit"} <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
