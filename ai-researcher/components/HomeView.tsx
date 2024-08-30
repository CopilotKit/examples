"use client";

import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { CornerDownLeftIcon } from "lucide-react";
import { useResearchContext } from "@/lib/research-provider";
import { motion } from "framer-motion";

const MAX_INPUT_LENGTH = 250;

export function HomeView() {
  const { setResearchQuery, researchInput, setResearchInput } =
    useResearchContext();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleResearch = () => {
    setResearchQuery(researchInput);
  };

  const suggestions = [
    { label: "Electric cars sold in 2024", icon: "🚙" },
    { label: "Top 10 richest people in the world", icon: "💰" },
    { label: "Population of the World", icon: "🌍 " },
    { label: "Best stocks in 2024", icon: "📈" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full flex flex-col gap-y-2 justify-center items-center"
    >
      <h1 className="text-4xl font-extralight mb-6">Where knowledge begins</h1>

      <div
        className={cn(
          "w-[600px] bg-slate-100/50 border shadow-sm rounded-md transition-all",
          {
            "ring-1 ring-slate-300": isInputFocused,
          }
        )}
      >
        <Textarea
          placeholder="Ask anything..."
          className="bg-transparent p-4 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 w-full"
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          value={researchInput}
          onChange={(e) => setResearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleResearch();
            }
          }}
          maxLength={MAX_INPUT_LENGTH}
        />
        <div className="text-xs p-4 flex items-center justify-between">
          <div
            className={cn("transition-all duration-300 mt-4 text-slate-500", {
              "opacity-0": !researchInput,
              "opacity-100": researchInput,
            })}
          >
            {researchInput.length} / {MAX_INPUT_LENGTH}
          </div>
          <Button
            size="sm"
            className={cn("rounded-full transition-all duration-300", {
              "opacity-0 pointer-events-none": !researchInput,
              "opacity-100": researchInput,
            })}
            onClick={handleResearch}
          >
            Research
            <CornerDownLeftIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 w-full gap-2 text-sm">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.label}
            onClick={() => setResearchQuery(suggestion.label)}
            className="p-2 bg-slate-100/50 rounded-md border flex cursor-pointer items-center space-x-2 hover:bg-slate-100 transition-all duration-300"
          >
            <span className="text-base">{suggestion.icon}</span>
            <span className="flex-1">{suggestion.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
