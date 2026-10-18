"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Optional free-text tag list (Enter or "Add" to append, × to remove).
export default function TagInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function remove(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  return (
    <div className="space-y-2">
      <label className="block pl-4.5 text-sm font-medium">
        {label}
        <span className="ml-1 font-normal text-muted-foreground">
          (optional)
        </span>
      </label>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="h-11 shrink-0 rounded-full px-5"
        >
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
            >
              {skill}
              <button
                type="button"
                onClick={() => remove(skill)}
                className="ml-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
