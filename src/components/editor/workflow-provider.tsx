"use client";

import { Provider } from "jotai";
import React from "react";

interface WorkflowProviderProps {
  children: React.ReactNode;
}

export default function WorkflowProvider({ children }: WorkflowProviderProps) {
  return <Provider>{children}</Provider>;
}
