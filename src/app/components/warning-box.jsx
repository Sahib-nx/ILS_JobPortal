"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import React from "react";

const WarningBox = ({ show, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40"
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-[90%] sm:w-[400px] bg-white/10 backdrop-blur-xl border border-yellow-400/40 rounded-2xl shadow-2xl p-6 text-center text-white"
          >
            <div className="flex flex-col items-center space-y-4">
              <AlertTriangle className="text-yellow-400 w-12 h-12 animate-pulse" />
              <h2 className="text-2xl font-semibold text-yellow-300">Warning</h2>
              <p className="text-gray-200 text-sm leading-relaxed">{message}</p>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={onConfirm}
                  className="px-5 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 transition-all duration-200 font-semibold text-white shadow-md"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={onCancel}
                  className="px-5 py-2 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-200 transition-all duration-200 font-semibold"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarningBox;
