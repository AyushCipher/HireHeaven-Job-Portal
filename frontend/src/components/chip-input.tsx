"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const ChipInput: React.FC<ChipInputProps> = ({
  values,
  onChange,
  placeholder,
}) => {
  const [current, setCurrent] = useState("");

  const add = () => {
    const trimmed = current.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setCurrent("");
  };

  const remove = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

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
        <Button type="button" onClick={add} variant="outline">
          Add
        </Button>
      </div>
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
