"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
}: ConfirmDialogProps) {
  // Prevent body scroll when dialog is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Use portal to render dialog at document body level
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Dialog Content */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200/50 transform transition-all duration-300 ease-out">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Alert content */}
        <div className="px-6 pb-6">
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-red-800">Warning</AlertTitle>
            <AlertDescription className="text-red-700">
              {description}
            </AlertDescription>
          </Alert>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end mt-6">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-gray-200 hover:bg-gray-50"
            >
              {cancelText}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
