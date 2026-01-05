"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Code, Variable } from "lucide-react";
import { useUpdateNode } from "@/hooks/use-nodes";
import Modal from "@/components/ui/modal";
import { NodeEditorProps } from "@/types";

// Template variables helper component
const TemplateVariablesHelper = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-2">
      <Variable className="h-4 w-4 text-blue-600" />
      <Label className="text-sm font-medium text-gray-700">
        Template Variables
      </Label>
    </div>
    <div className="space-y-1 text-xs text-gray-600">
      <p>Use these variables in your request:</p>
      <div className="grid grid-cols-1 gap-1 mt-2">
        <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
          {"{{trigger.data.email}}"} - From trigger node
        </code>
        <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
          {"{{trigger.data.userId}}"} - User ID from trigger
        </code>
        <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
          {"{{previousNode.response.data.id}}"} - Previous node response
        </code>
        <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
          {"{{workflow.id}}"} - Current workflow ID
        </code>
      </div>
    </div>
  </div>
);

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
    actionType: nodeData.actionType || "webhook",
    method: nodeData.method || "POST",
    endpoint: nodeData.endpoint || "",
    requestBody: nodeData.requestBody || "",
    headers: nodeData.headers || {},
    webhookUrl: nodeData.webhookUrl || "",
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
          actionType: formData.actionType,
          method: formData.method,
          endpoint: formData.endpoint,
          requestBody: formData.requestBody,
          headers: formData.headers,
          webhookUrl: formData.webhookUrl,
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
    setFormData(prev => ({ ...prev, [field]: value }));
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

        {/* Trigger-specific webhook configuration */}
        {nodeType === "trigger" && (
          <div className="space-y-4">
            <TemplateVariablesHelper />

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={formData.webhookUrl || ""}
                onChange={e => handleInputChange("webhookUrl", e.target.value)}
                placeholder="https://your-domain.com/webhooks/ai-workflow"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                This URL will receive webhook requests to trigger the AI
                workflow
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggerMethod">HTTP Method</Label>
              <select
                id="triggerMethod"
                className="w-full p-2 border rounded-md"
                value={formData.method || "POST"}
                onChange={e => handleInputChange("method", e.target.value)}
              >
                <option value="POST">POST (Recommended)</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggerHeaders">
                Expected Headers (Optional)
              </Label>
              <Textarea
                id="triggerHeaders"
                value={JSON.stringify(formData.headers || {}, null, 2)}
                onChange={e => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    handleInputChange("headers", headers);
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder={`{
  "Content-Type": "application/json",
  "X-API-Key": "your-api-key"
}`}
                rows={3}
                className="w-full font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Add more node-specific fields here based on nodeType */}
        {nodeType === "action" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <select
                id="actionType"
                className="w-full p-2 border rounded-md"
                value={formData.actionType}
                onChange={e => handleInputChange("actionType", e.target.value)}
              >
                <option value="webhook">HTTP Request</option>
                <option value="email">Send Email</option>
                <option value="database">Database Query</option>
              </select>
            </div>

            {formData.actionType === "webhook" && (
              <>
                <TemplateVariablesHelper />

                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <select
                    id="method"
                    className="w-full p-2 border rounded-md"
                    value={formData.method}
                    onChange={e => handleInputChange("method", e.target.value)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input
                    id="endpoint"
                    value={formData.endpoint}
                    onChange={e =>
                      handleInputChange("endpoint", e.target.value)
                    }
                    placeholder="https://api.example.com/webhook?userId={{trigger.data.userId}}"
                    className="w-full"
                  />
                </div>

                {(formData.method === "POST" ||
                  formData.method === "PUT" ||
                  formData.method === "PATCH") && (
                  <div className="space-y-2">
                    <Label htmlFor="requestBody">Request Body (JSON)</Label>
                    <Textarea
                      id="requestBody"
                      value={formData.requestBody}
                      onChange={e =>
                        handleInputChange("requestBody", e.target.value)
                      }
                      placeholder={`{
  "email": "{{trigger.data.email}}",
  "userId": "{{trigger.data.userId}}",
  "workflowId": "{{workflow.id}}"
}`}
                      rows={4}
                      className="w-full font-mono text-sm"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="headers">Headers (JSON)</Label>
                  <Textarea
                    id="headers"
                    value={JSON.stringify(formData.headers, null, 2)}
                    onChange={e => {
                      try {
                        const headers = JSON.parse(e.target.value);
                        handleInputChange("headers", headers);
                      } catch {
                        // Invalid JSON, don't update
                      }
                    }}
                    placeholder={`{
  "Content-Type": "application/json",
  "X-Workflow-ID": "{{workflow.id}}"
}`}
                    rows={3}
                    className="w-full font-mono text-sm"
                  />
                </div>
              </>
            )}
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
