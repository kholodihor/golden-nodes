"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useSuspenseWorkflows } from "@/hooks/use-workflows";

export const PaginationControls = () => {
  const workflowsQuery = useSuspenseWorkflows();
  const { pagination } = workflowsQuery.data;

  // Pagination temporarily simplified - no URL state
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing 1 to {Math.min(10, pagination.totalCount)} of{" "}
        {pagination.totalCount} workflows
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={true}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">
            Page 1 of {pagination.totalPages}
          </span>
        </div>

        <Button variant="outline" size="sm" disabled={true}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
