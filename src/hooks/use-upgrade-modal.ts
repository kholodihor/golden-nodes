"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type UseUpgradeModalProps = {
  currentPlan?: string;
  features?: string[];
};

export const useUpgradeModal = ({
  currentPlan = "Free",
  features = [
    "Unlimited workflows",
    "Advanced analytics",
    "Priority support",
    "Custom integrations",
    "Team collaboration",
    "Advanced security features",
  ],
}: UseUpgradeModalProps = {}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openUpgradeModal = () => setIsOpen(true);
  const closeUpgradeModal = () => setIsOpen(false);

  const handleUpgrade = () => {
    authClient.checkout({
      slug: "pro",
    });
    closeUpgradeModal();
  };

  return {
    isOpen,
    openUpgradeModal,
    closeUpgradeModal,
    handleUpgrade,
    currentPlan,
    features,
  };
};
