"use client";

import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          className="flex flex-col items-center justify-center space-y-8 my-32"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-t-2 border-l-2 border-accent-primary animate-spin"></div>
            <div className="absolute inset-0 w-24 h-24 rounded-full border-r-2 border-b-2 border-accent-secondary/50 animate-[spin_3s_linear_reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            </div>
          </div>
          <div className="h-8 text-center relative w-full flex items-center justify-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-text-muted font-mono text-sm uppercase tracking-widest"
            >
              {message || "Processing..."}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
