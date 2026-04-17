"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import {
  Plus, Brain, Activity, Layout, LogOut, User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SimulationLab } from "@/components/SimulationLab";
import { FounderBrief } from "@/components/FounderBrief";
import { CommandCenter } from "@/components/CommandCenter";

export default function Home() {
  const [phase, setPhase] = useState<'IDLE' | 'COMMAND_CENTER' | 'INTAKE' | 'SIMULATION'>('IDLE');
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number>(0);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setPhase('COMMAND_CENTER');
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
        if (profile) setCredits(profile.credits);
      } else {
        setPhase('IDLE');
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPhase('IDLE');
  };

  return (
    <div className="flex h-screen bg-[#050505] text-[#e1e1e1] overflow-hidden">
      <div className="scanline" />

      {/* OS SIDEBAR */}
      <aside className="w-16 border-r border-white/5 flex flex-col items-center py-6 space-y-8 bg-[#0a0a0a] z-50">
         <div onClick={() => setPhase(user ? 'COMMAND_CENTER' : 'IDLE')} className="w-10 h-10 bg-accent/20 border border-accent/40 rounded-xl flex items-center justify-center cursor-pointer hover:bg-accent/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Brain className="w-5 h-5 text-accent" />
         </div>
         <nav className="flex flex-col gap-8 opacity-60">
            <div onClick={() => setPhase('COMMAND_CENTER')} className={`cursor-pointer hover:text-accent transition-colors ${phase === 'COMMAND_CENTER' ? 'text-accent opacity-100' : ''}`}>
               <Layout className="w-5 h-5" />
            </div>
            <div onClick={() => setPhase('SIMULATION')} className={`cursor-pointer hover:text-accent transition-colors ${phase === 'SIMULATION' ? 'text-accent opacity-100' : ''}`}>
               <Activity className="w-5 h-5" />
            </div>
            <div onClick={() => setPhase('INTAKE')} className={`cursor-pointer hover:text-accent transition-colors ${phase === 'INTAKE' ? 'text-accent opacity-100' : ''}`}>
               <Plus className="w-5 h-5" />
            </div>
         </nav>
         <div className="flex-1" />
         {user ? (
            <div className="flex flex-col gap-6 items-center pb-4">
              <button onClick={handleLogout} className="text-zinc-800 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
         ) : (
            <button onClick={() => router.push('/login')} className="p-2 text-zinc-700 hover:text-white transition-colors">
               <UserIcon className="w-5 h-5" />
            </button>
         )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
         {/* OS HEADER */}
         <header className="h-12 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a] relative z-40">
            <div className="flex items-center gap-6 terminal-text uppercase tracking-widest font-black text-[10px]">
               <span className="text-accent flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
                  Grid Active
               </span>
               <span className="text-zinc-800">|</span>
               <span className="text-white">Nexus OS v2.0</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="px-3 py-1 bg-white/5 border border-white/10 rounded uppercase text-[9px] font-bold text-zinc-400">
                  Signal Balance: {user ? credits : '0'}
               </div>
            </div>
         </header>

         {/* OS WORKSPACE */}
         <main className="flex-1 overflow-y-auto relative scrollbar-hide">
            <AnimatePresence mode="wait">
               {phase === 'IDLE' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
                     <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
                        Decision <span className="text-accent">OS.</span>
                     </h1>
                     <p className="text-zinc-500 text-sm max-w-lg font-medium">
                        Your daily operating system for survival, execution, and growth. Integrate financials, tasks, and strategy into one unified grid.
                     </p>
                     <button onClick={() => router.push('/login')} className="px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-accent transition-all shadow-2xl">
                        Initialize Grid
                     </button>
                  </motion.div>
               )}

               {phase === 'COMMAND_CENTER' && (
                  <motion.div key="command" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <CommandCenter 
                        onLogDecision={() => setPhase('INTAKE')} 
                        onOpenSimulation={() => setPhase('SIMULATION')} 
                     />
                  </motion.div>
               )}

               {phase === 'INTAKE' && (
                  <motion.div key="intake" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <FounderBrief onComplete={() => setPhase('COMMAND_CENTER')} isProcessing={false} />
                  </motion.div>
               )}
               {phase === 'SIMULATION' && (
                  <motion.div key="simulation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                     <SimulationLab onBack={() => setPhase('COMMAND_CENTER')} />
                  </motion.div>
               )}
               
            </AnimatePresence>
         </main>
      </div>
    </div>
  );
}
