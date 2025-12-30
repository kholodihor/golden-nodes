"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useWorkflowsParams } from "@/hooks/use-workflows-params";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchInput = () => {
  const [params, setParams] = useWorkflowsParams();
  const [localSearch, setLocalSearch] = useState(params.search);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Update URL params when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== params.search) {
      setParams(prev => ({
        ...prev,
        search: debouncedSearch,
        page: 1, // Reset to first page when searching
      }));
    }
  }, [debouncedSearch, params.search, setParams]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search workflows..."
        value={localSearch}
        onChange={e => handleSearchChange(e.target.value)}
        className="pl-10 max-w-[200px] md:max-w-[400px]"
      />
    </div>
  );
};
