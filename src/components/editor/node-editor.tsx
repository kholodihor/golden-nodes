"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { useUpdateNode } from "@/hooks/use-nodes";
import Modal from "@/components/ui/modal";

interface NodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeData: {
    label: string;
    description: string;
    [key: string]: any;
  };
  nodeType: "trigger" | "action" | "custom";
}

export default function NodeEditor({
  isOpen,
  onClose,
  nodeId,
  nodeData,
  nodeType,
}: NodeEditorProps) {
  const updateNode = useUpdateNode();
  const [formData, setFormData] = useState({
    label: nodeData.label || "",
    description: nodeData.description || "",
    // Add more fields as needed for different node types
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Updating node:", {
      nodeId,
      formData,
      currentData: nodeData,
    });

    updateNode.mutate(
      {
        id: nodeId,
        name: formData.label,
        data: {
          ...nodeData,
          label: formData.label,
          description: formData.description,
        },
      },
      {
        onSuccess: result => {
          console.log("Node updated successfully:", result);
          onClose();
        },
        onError: error => {
          console.error("Failed to update node:", error);
        },
      },
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Node">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-gray-600" />
        <Badge variant="outline" className="text-xs">
          {nodeType}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={formData.label}
            onChange={e => handleInputChange("label", e.target.value)}
            placeholder="Enter node label"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => handleInputChange("description", e.target.value)}
            placeholder="Enter node description"
            rows={3}
            className="w-full resize-none"
          />
        </div>

        {/* Add more node-specific fields here based on nodeType */}
        {nodeType === "action" && (
          <div className="space-y-2">
            <Label htmlFor="action">Action Type</Label>
            <select
              id="action"
              className="w-full p-2 border rounded-md"
              defaultValue="default"
            >
              <option value="default">Default Action</option>
              <option value="email">Send Email</option>
              <option value="webhook">Webhook Call</option>
              <option value="database">Database Query</option>
            </select>
          </div>
        )}

        {nodeType === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="customConfig">Custom Configuration</Label>
            <Input
              id="customConfig"
              placeholder="Custom setting"
              className="w-full"
            />
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
