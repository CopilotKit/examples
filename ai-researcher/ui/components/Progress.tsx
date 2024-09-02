import { cn } from "@/lib/utils";
import { CheckIcon, LoaderCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Progress() {
  const steps = [
    { description: "Searching", status: "done", updates: ["Done X", "Done Y"] },
    {
      description: "Summarizing",
      status: "done",
      updates: ["Done X", "Done Y"],
    },
    { description: "Generating answer", status: "in_progress", updates: ["Done X", "Done Y"] },
  ];

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden text-sm py-2">
      {steps.map((step, index) => (
        <div key={index} className="flex">
          <div className="w-8">
            <div className="w-4 h-4 bg-slate-700 flex items-center justify-center rounded-full mt-[10px] ml-[12px]">
              {step.status === "done" ? (
                <CheckIcon className="w-3 h-3 text-white" />
              ) : (
                <LoaderCircle className="w-3 h-3 text-white animate-spin" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn("h-full w-[1px] bg-slate-200 ml-[20px]")}
              ></div>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <Accordion type="single" collapsible className="w-full pr-2 py-0">
              <AccordionItem value="item-1">
                <AccordionTrigger hideChevron={step.updates.length === 0}>{step.description}</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  {step.updates.map((update, index) => (
                    <div key={index} className="text-slate-500 text-xs">
                      {update}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      ))}
    </div>
  );
}
