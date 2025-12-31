"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useWorkflowsParams } from "@/hooks/use-workflows-params";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchInput = () => {
  const [params, setParams] = useWorkflowsParams();
  const [localValue, setLocalValue] = useState(params.search);
  const debouncedValue = useDebounce(localValue, 300);
  const [isFocused, setIsFocused] = useState(false);

  // Update URL params when debounced value changes
  useEffect(() => {
    if (debouncedValue !== params.search) {
      setParams(prev => ({
        ...prev,
        search: debouncedValue,
        page: 1,
      }));
    }
  }, [debouncedValue, params.search, setParams]);

  return (
    <div className="relative group">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
          <Search
            className={`h-4 w-4 transition-colors ${
              isFocused ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>

        <Input
          placeholder="Search workflows..."
          value={localValue}
          onChange={e => setLocalValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-10 transition-all duration-200 ${
            isFocused
              ? "ring-1 ring-primary/30 shadow-sm shadow-primary/10 border-primary bg-background/98"
              : "border-border bg-background hover:bg-muted/50"
          } max-w-[200px] md:max-w-[400px]`}
        />
      </div>
    </div>
  );
};
