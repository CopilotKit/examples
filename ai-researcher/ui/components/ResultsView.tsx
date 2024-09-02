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
import { Progress } from "./Progress";
import { AnswerMarkdown } from "./AnswerMarkdown";

export function ResultsView() {
  const { researchQuery, setResearchQuery } = useResearchContext();
  const { state: agentState, setState: setAgentState } = useCoagent({
    name: "search_agent",
  });

  const steps =
    agentState?.steps?.map((step: any) => {
      return {
        description: step.description || "",
        status: step.status || "pending",
        updates: step.updates || [],
      };
    }) || [];

  const isLoading = !agentState?.answer?.markdown;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="w-[1000px] p-12 flex flex-col gap-y-8">
        <div className="space-y-4 mt-20">
          {/* <Button
            variant="link"
            onClick={() => setResearchQuery("")}
            className="flex p-0 items-center justify-center gap-x-1  text-slate-500 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Button> */}
          <h1 className="text-4xl font-extralight">{researchQuery}</h1>
        </div>

        <Progress steps={steps} />

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
            <div className="text-slate-500 font-light">
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <AnswerMarkdown markdown={agentState?.answer?.markdown} />
              )}
            </div>
          </div>

          {agentState?.answer?.references?.length && (
            <div className="flex flex-col gap-y-4 w-[200px]">
              <h2 className="flex items-center gap-x-2">
                <BookOpenIcon className="w-4 h-4 text-slate-500" />
                References
              </h2>
              <ul className="text-slate-900 font-light text-sm flex flex-col gap-y-2">
                {agentState?.answer?.references?.map(
                  (ref: any, idx: number) => (
                    <li key={idx}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {idx + 1}. {ref.title}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
