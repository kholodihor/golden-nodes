"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useWorkflowsParams } from "@/hooks/use-workflows-params";
import { useSuspenseWorkflows } from "@/hooks/use-workflows";

export const PaginationControls = () => {
  const [params, setParams] = useWorkflowsParams();
  const workflowsQuery = useSuspenseWorkflows();

  const { page, pageSize } = params;
  const { pagination } = workflowsQuery.data;

  // if (!pagination || pagination.totalPages <= 1) {
  //   return null;
  // }

  const handlePageChange = (newPage: number) => {
    setParams(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      handlePageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(page + 1);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {(page - 1) * pageSize + 1} to{" "}
        {Math.min(page * pageSize, pagination.totalCount)} of{" "}
        {pagination.totalCount} workflows
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={!pagination.hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">
            Page {page} of {pagination.totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!pagination.hasNextPage}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
