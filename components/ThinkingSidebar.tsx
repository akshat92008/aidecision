"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Cpu, Activity } from "lucide-react";
import { AgentThought } from "@/lib/shared/schemas";

interface ThinkingSidebarProps {
  thoughts: AgentThought[];
  activeAgent?: string;
}

export function ThinkingSidebar({ thoughts, activeAgent }: ThinkingSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts]);

  return (
    <div className="h-full border-l border-terminal-border bg-obsidian/50 backdrop-blur-md flex flex-col font-mono text-[10px] overflow-hidden">
      <div className="p-4 border-b border-terminal-border flex items-center gap-2 text-accent-primary uppercase font-black tracking-widest">
        <Cpu className="w-3 h-3 animate-pulse" />
        <span>Neural Processing Log</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-terminal-border"
      >
        <AnimatePresence initial={false}>
          {thoughts.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-accent-secondary font-bold">
                <span>[{t.agent}]</span>
                <span className="opacity-40">{new Date(t.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-text-muted leading-relaxed border-l border-white/5 pl-2">
                {t.thought}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {activeAgent && (
          <div className="flex items-center gap-2 text-accent-primary animate-pulse">
            <Activity className="w-3 h-3" />
            <span>[{activeAgent}] STREAMING REASONING...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-terminal-border bg-black/40">
        <div className="flex items-center gap-2 text-[8px] text-text-muted uppercase tracking-widest">
          <Terminal className="w-2 h-2" />
          <span>System Status: Optimal</span>
        </div>
      </div>
    </div>
  );
}
