"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

const ChipInput: React.FC<ChipInputProps> = ({
  values,
  onChange,
  placeholder,
  suggestions,
}) => {
  const [current, setCurrent] = useState("");

  const add = (value?: string) => {
    const trimmed = (value ?? current).trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    if (value === undefined) setCurrent("");
  };

  const remove = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  const unusedSuggestions = (suggestions || []).filter(
    (s) => !values.includes(s)
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-10"
        />
        <Button type="button" onClick={() => add()} variant="outline">
          Add
        </Button>
      </div>
      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unusedSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-dashed opacity-60 hover:opacity-100 hover:border-blue-400 transition-all"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <div
              key={v}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-sm"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChipInput;
