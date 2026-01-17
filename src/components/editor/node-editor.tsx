"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Variable, ChevronDown, ChevronUp } from "lucide-react";
import { useUpdateNode } from "@/hooks/use-nodes";
import Modal from "@/components/ui/modal";
import { NodeEditorProps } from "@/types";

// Template variables helper component
const TemplateVariablesHelper = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 mb-2 w-full hover:bg-gray-100 rounded p-1 transition-colors"
      >
        <Variable className="h-4 w-4 text-blue-600" />
        <Label className="text-sm font-medium text-gray-700">
          Template Variables (Handlebars)
        </Label>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-gray-600 ml-auto" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-600 ml-auto" />
        )}
      </button>
      {!isCollapsed && (
        <div className="space-y-1 text-xs text-gray-600">
          <p>Use Handlebars syntax for powerful templating:</p>
          <div className="grid grid-cols-1 gap-1 mt-2">
            <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
              {"{{trigger.data.email}}"} - From trigger node
            </code>
            <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
              {"{{trigger.data.userId}}"} - User ID from trigger
            </code>
            <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
              {"{{trigger.data.name}}"} - User name from trigger
            </code>
            <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
              {"{{previousNode.response.data.id}}"} - Previous node response
            </code>
            <code className="bg-white px-2 py-1 rounded border border-gray-300 block">
              {"{{workflow.id}}"} - Current workflow ID
            </code>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium mb-1">Handlebars Features:</p>
            <div className="grid grid-cols-1 gap-1">
              <code className="bg-white px-2 py-1 rounded border border-gray-300 block text-xs">
                {"{{#if trigger.data.isActive}}Active{{else}}Inactive{{/if}}"}
              </code>
              <code className="bg-white px-2 py-1 rounded border border-gray-300 block text-xs">
                {"{{#each trigger.data.items}}{{this}}{{/each}}"}
              </code>
              <code className="bg-white px-2 py-1 rounded border border-gray-300 block text-xs">
                {"{{json previousNode.response}}"} - JSON stringify
              </code>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="font-medium mb-1">Custom Helpers:</p>
            <div className="grid grid-cols-1 gap-1">
              <code className="bg-white px-2 py-1 rounded border border-gray-300 block text-xs">
                {"{{uppercase trigger.data.name}}"} - Uppercase text
              </code>
              <code className="bg-white px-2 py-1 rounded border border-gray-300 block text-xs">
                {"{{default trigger.data.email 'no-email@example.com'}}"} -
                Default value
              </code>
              <code className="bg-white px-2 py-1 rounded border border-gray-300 block text-xs">
                {"{{timestamp}}"} - Current timestamp
              </code>
              <code className="bg-white px-2 py-1 rounded border border-gray-300 block text-xs">
                {"{{math trigger.data.count '+' 1}}"} - Math operations
              </code>
              <code className="bg-white px-2 py-1 rounded border border-gray-300 block text-xs">
                {"{{formatDate trigger.data.createdAt 'short'}}"} - Format date
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function NodeEditor({
  isOpen,
  onClose,
  nodeId,
  nodeData,
  nodeType,
}: NodeEditorProps) {
  const updateNode = useUpdateNode();

  // Debug logging
  console.log("NodeEditor props:", { nodeType, nodeData, nodeId });

  const [formData, setFormData] = useState({
    label: nodeData.label || "",
    description: nodeData.description || "",
    actionType: nodeData.actionType || "webhook",
    method: nodeData.method || "POST",
    endpoint: nodeData.endpoint || "",
    requestBody: nodeData.requestBody || "",
    headers: nodeData.headers || {},
    webhookUrl: nodeData.webhookUrl || "",
    // Email fields
    to: nodeData.to || "",
    subject: nodeData.subject || "",
    body: nodeData.body || "",
    from: nodeData.from || "",
    // Database fields
    queryType: nodeData.queryType || "SELECT",
    query: nodeData.query || "",
    tableName: nodeData.tableName || "",
    // Condition fields
    condition: nodeData.condition || "",
    operator: nodeData.operator || "equals",
    value: nodeData.value || "",
    expression: nodeData.expression || "",
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
          // Email fields
          to: formData.to,
          subject: formData.subject,
          body: formData.body,
          from: formData.from,
          // Database fields
          queryType: formData.queryType,
          query: formData.query,
          tableName: formData.tableName,
          // Condition fields
          condition: formData.condition,
          operator: formData.operator,
          value: formData.value,
          expression: formData.expression,
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

        {/* START node configuration */}
        {nodeType === "START" && (
          <div className="space-y-4">
            <TemplateVariablesHelper />

            <div className="space-y-2">
              <Label htmlFor="startMessage">Start Message</Label>
              <Input
                id="startMessage"
                value={formData.webhookUrl || ""}
                onChange={e => handleInputChange("webhookUrl", e.target.value)}
                placeholder="Welcome message or initial data"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                This message will be included in the workflow start data
              </p>
            </div>
          </div>
        )}

        {/* Condition node configuration */}
        {nodeType === "CONDITION" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conditionType">Condition Type</Label>
              <select
                id="conditionType"
                className="w-full p-2 border rounded-md"
                value={formData.expression ? "expression" : "simple"}
                onChange={e => {
                  if (e.target.value === "expression") {
                    handleInputChange(
                      "expression",
                      formData.expression || "status === 'success'",
                    );
                    handleInputChange("condition", "");
                  } else {
                    handleInputChange(
                      "condition",
                      formData.condition || "status",
                    );
                    handleInputChange("expression", "");
                  }
                }}
              >
                <option value="simple">Simple Condition</option>
                <option value="expression">Custom Expression</option>
              </select>
            </div>

            {!formData.expression ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="condition">Field/Variable</Label>
                  <Input
                    id="condition"
                    value={formData.condition}
                    onChange={e =>
                      handleInputChange("condition", e.target.value)
                    }
                    placeholder="e.g., {{status}} or trigger.data.email"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Use {"{{variable}}"} syntax for template variables
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operator">Operator</Label>
                  <select
                    id="operator"
                    className="w-full p-2 border rounded-md"
                    value={formData.operator}
                    onChange={e =>
                      handleInputChange("operator", e.target.value)
                    }
                  >
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not Equals</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="greater_equal">Greater or Equal</option>
                    <option value="less_equal">Less or Equal</option>
                    <option value="contains">Contains</option>
                    <option value="not_contains">Not Contains</option>
                    <option value="starts_with">Starts With</option>
                    <option value="ends_with">Ends With</option>
                    <option value="is_empty">Is Empty</option>
                    <option value="is_not_empty">Is Not Empty</option>
                    <option value="exists">Exists</option>
                    <option value="not_exists">Not Exists</option>
                  </select>
                </div>

                {!["is_empty", "is_not_empty", "exists", "not_exists"].includes(
                  formData.operator,
                ) && (
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      value={formData.value}
                      onChange={e => handleInputChange("value", e.target.value)}
                      placeholder="Value to compare against"
                      className="w-full"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="expression">Expression</Label>
                <Textarea
                  id="expression"
                  value={formData.expression}
                  onChange={e =>
                    handleInputChange("expression", e.target.value)
                  }
                  placeholder="e.g., status === 'success' && count > 5"
                  rows={3}
                  className="w-full font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Use JavaScript expressions with variables. Available
                  operators: ===, !==, &gt;, &lt;, &gt;=, &lt;=, &&, ||, !
                </p>
              </div>
            )}

            <TemplateVariablesHelper />
          </div>
        )}

        {/* HTTP Request node configuration */}
        {nodeType === "HTTP_REQUEST" && (
          <div className="space-y-4">
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
                onChange={e => handleInputChange("endpoint", e.target.value)}
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
          </div>
        )}

        {/* Email node configuration */}
        {nodeType === "EMAIL" && (
          <div className="space-y-4">
            <TemplateVariablesHelper />

            <div className="space-y-2">
              <Label htmlFor="to">To Email</Label>
              <Input
                id="to"
                value={formData.to}
                onChange={e => handleInputChange("to", e.target.value)}
                placeholder="{{trigger.data.email}}"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Use {"{{variable}}"} syntax for template variables
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={e => handleInputChange("subject", e.target.value)}
                placeholder="Email subject"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From Email</Label>
              <Input
                id="from"
                value={formData.from}
                onChange={e => handleInputChange("from", e.target.value)}
                placeholder="noreply@yourdomain.com"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={e => handleInputChange("body", e.target.value)}
                placeholder={`Hello {{trigger.data.name}},

Your workflow {{workflow.id}} has completed successfully.

Best regards`}
                rows={6}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Database Query node configuration */}
        {nodeType === "DATABASE_QUERY" && (
          <div className="space-y-4">
            <TemplateVariablesHelper />

            <div className="space-y-2">
              <Label htmlFor="queryType">Query Type</Label>
              <select
                id="queryType"
                className="w-full p-2 border rounded-md"
                value={formData.queryType}
                onChange={e => handleInputChange("queryType", e.target.value)}
              >
                <option value="SELECT">SELECT (Read)</option>
                <option value="INSERT">INSERT (Create)</option>
                <option value="UPDATE">UPDATE (Modify)</option>
                <option value="DELETE">DELETE (Remove)</option>
              </select>
            </div>

            {formData.queryType === "SELECT" && (
              <div className="space-y-2">
                <Label htmlFor="tableName">Table Name</Label>
                <Input
                  id="tableName"
                  value={formData.tableName}
                  onChange={e => handleInputChange("tableName", e.target.value)}
                  placeholder="users"
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="query">SQL Query</Label>
              <Textarea
                id="query"
                value={formData.query}
                onChange={e => handleInputChange("query", e.target.value)}
                placeholder={`SELECT * FROM users WHERE id = {{trigger.data.userId}}`}
                rows={4}
                className="w-full font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Use {"{{variable}}"} syntax for template variables
              </p>
            </div>
          </div>
        )}

        {/* Add more node-specific fields here based on nodeType */}
        {nodeType === "ACTION" && (
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
