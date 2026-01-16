"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCreateNode } from "@/hooks/use-nodes";
import { Plus, Mail, Database, Filter, Play, Globe } from "lucide-react";

interface NodePaletteProps {
  workflowId: string;
}

const nodeTypes = [
  {
    type: "START" as const,
    label: "Start",
    description: "Initialize workflow execution",
    icon: Play,
    color: "bg-green-500",
  },
  {
    type: "HTTP_REQUEST" as const,
    label: "HTTP Request",
    description: "Make HTTP request to external API",
    icon: Globe,
    color: "bg-purple-500",
  },
  {
    type: "EMAIL" as const,
    label: "Send Email",
    description: "Send email notification",
    icon: Mail,
    color: "bg-blue-500",
  },
  {
    type: "DATABASE_QUERY" as const,
    label: "Database Query",
    description: "Query database for data",
    icon: Database,
    color: "bg-blue-500",
  },
  {
    type: "CONDITION" as const,
    label: "Condition",
    description: "Conditional logic branching",
    icon: Filter,
    color: "bg-orange-500",
  },
];

export default function NodePalette({ workflowId }: NodePaletteProps) {
  const createNode = useCreateNode();

  const handleAddNode = (nodeType: (typeof nodeTypes)[0]) => {
    // Use a simple incremental position (will be adjusted by user dragging)
    const nodeCount = document.querySelectorAll(".react-flow__node").length;
    const x = 200 + ((nodeCount * 50) % 300);
    const y = 100 + Math.floor(nodeCount / 6) * 80;

    createNode.mutate({
      workflowId,
      name: nodeType.label,
      type: nodeType.type,
      data: {
        label: nodeType.label,
        description: nodeType.description,
        // Set default data based on node type
        ...(nodeType.type === "START" && {
          webhookUrl: "Workflow started successfully",
        }),
        ...(nodeType.type === "HTTP_REQUEST" && {
          method: "POST",
          endpoint: "",
          headers: { "Content-Type": "application/json" },
          requestBody: "",
        }),
        ...(nodeType.type === "EMAIL" && {
          to: "{{trigger.data.email}}",
          subject: "Workflow Notification",
          body: "Hello {{trigger.data.name}},\n\nYour workflow has completed successfully.",
          from: "noreply@yourdomain.com",
        }),
        ...(nodeType.type === "DATABASE_QUERY" && {
          queryType: "SELECT",
          query: "SELECT * FROM users WHERE id = {{trigger.data.userId}}",
          tableName: "users",
        }),
        ...(nodeType.type === "CONDITION" && {
          condition: "status",
          operator: "equals",
          value: "success",
        }),
      },
      position: { x, y },
    });
  };

  return (
    <Card className="w-64 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Node
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {nodeTypes.map((nodeType, index) => {
          const Icon = nodeType.icon;
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-start h-auto p-3"
              onClick={() => handleAddNode(nodeType)}
              disabled={createNode.isPending}
            >
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`p-1.5 rounded ${nodeType.color} flex-shrink-0`}
                >
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium truncate">
                      {nodeType.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1 py-0 flex-shrink-0"
                    >
                      {nodeType.type}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {nodeType.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
