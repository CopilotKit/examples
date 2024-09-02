"use client";

import { useResearchContext } from "@/lib/research-provider";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  LoaderCircleIcon,
  SparkleIcon,
} from "lucide-react";
import { SkeletonLoader } from "./SkeletonLoader";
import { Button } from "./ui/button";
import { useCoagent } from "@copilotkit/react-core";

export function ResultsView() {
  const { researchQuery, setResearchQuery, isLoading, researchResult } =
    useResearchContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="w-[800px] p-12 flex flex-col gap-y-8">
        <div className="space-y-4">
          <Button
            variant="link"
            onClick={() => setResearchQuery("")}
            className="flex p-0 items-center justify-center gap-x-1  text-slate-500 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-4xl font-extralight mb-3">{researchQuery}</h1>
        </div>

        <div className="flex gap-x-8">
          <div className="flex-1 flex flex-col gap-y-4">
            <h2 className="flex items-center gap-x-2">
              {isLoading ? (
                <LoaderCircleIcon className="animate-spin w-4 h-4 text-slate-500" />
              ) : (
                <SparkleIcon className="w-4 h-4 text-slate-500" />
              )}
              Answer
            </h2>
            <div className="text-slate-500 font-light text-sm">
              {isLoading ? <SkeletonLoader /> : <p>{researchResult?.answer}</p>}
            </div>
          </div>

          {researchResult?.sources.length && (
            <div className="flex flex-col gap-y-4">
              <h2 className="flex items-center gap-x-2">
                <BookOpenIcon className="w-4 h-4 text-slate-500" />
                Sources
              </h2>
              <ul className="text-slate-500 font-light text-sm flex flex-col gap-y-2">
                {researchResult?.sources.map((source, idx) => (
                  <li key={source}>
                    <a href={source} target="_blank" rel="noopener noreferrer">
                      {idx + 1}. {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
