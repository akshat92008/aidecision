"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Brain, Mail, ArrowRight, Terminal, Github, Chrome } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setIsSuccess(true);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e1e1e1] flex items-center justify-center relative overflow-hidden">
      <div className="scanline" />
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border-r border-white/5 h-full opacity-20" />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-10 space-y-12 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/20 border border-accent/40 rounded-2xl mb-4 relative">
             <Brain className="w-10 h-10 text-accent shadow-glow" />
             <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-foreground border-2 border-[#050505] rounded-full animate-pulse" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Initialize Nexus</h1>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
            Secure the Strategic Memory for your Decision OS.
          </p>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 border border-accent/20 bg-accent/5 rounded-2xl text-center space-y-4"
          >
            <div className="w-12 h-12 bg-accent/20 border border-accent/40 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Signal Sent</h3>
            <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">Check your command interface (Email) for the login link.</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <label className="terminal-text text-[10px] uppercase font-black text-accent tracking-[0.2em]">Primary Identifier (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-accent transition-colors" />
                  <input 
                    type="email"
                    required
                    placeholder="founder@nexus-os.com"
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded focus:outline-none focus:border-accent/40 transition-all font-mono text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button 
                disabled={isLoading}
                className="w-full bg-white text-black py-4 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-white/5 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Encrypting..." : "Request Magic Link"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black text-zinc-700 tracking-widest">
                <span className="bg-[#050505] px-4 italic">Social Integration</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleOAuth('google')}
                className="flex items-center justify-center gap-3 border border-white/5 bg-[#0a0a0a] py-3 rounded text-[10px] items-center uppercase font-black tracking-widest hover:border-white/20 hover:bg-white/5 transition-all transition-colors active:scale-95"
              >
                <Chrome className="w-4 h-4" /> Google
              </button>
              <button 
                onClick={() => handleOAuth('github')}
                className="flex items-center justify-center gap-3 border border-white/5 bg-[#0a0a0a] py-3 rounded text-[10px] items-center uppercase font-black tracking-widest hover:border-white/20 hover:bg-white/5 transition-all transition-colors active:scale-95"
              >
                <Github className="w-4 h-4" /> Github
              </button>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-4 text-zinc-800">
             <Terminal className="w-4 h-4" />
             <span className="terminal-text text-[9px] uppercase font-black tracking-widest">Decision Encryption Matrix v2.0.4 - Secure</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
