"use client";
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface RoundInput {
  name: string;
  description: string;
}

interface RoundsBuilderProps {
  rounds: RoundInput[];
  onChange: (rounds: RoundInput[]) => void;
}

const RoundsBuilder: React.FC<RoundsBuilderProps> = ({ rounds, onChange }) => {
  const addRound = () => onChange([...rounds, { name: "", description: "" }]);

  const removeRound = (index: number) =>
    onChange(rounds.filter((_, i) => i !== index));

  const updateRound = (
    index: number,
    field: keyof RoundInput,
    value: string
  ) => {
    const next = [...rounds];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {rounds.map((round, index) => (
        <div
          key={index}
          className="flex gap-3 items-start p-3 rounded-lg border bg-secondary/30"
        >
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Round name (e.g. Technical Interview)"
              value={round.name}
              onChange={(e) => updateRound(index, "name", e.target.value)}
              className="h-10"
            />
            <Input
              placeholder="Description (optional)"
              value={round.description}
              onChange={(e) =>
                updateRound(index, "description", e.target.value)
              }
              className="h-10"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-red-500 hover:text-red-600"
            onClick={() => removeRound(index)}
            disabled={rounds.length <= 1}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={addRound}
      >
        <Plus size={14} /> Add Round
      </Button>
    </div>
  );
};

export default RoundsBuilder;
