"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Crown, Zap, Shield, Star } from "lucide-react";

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentPlan?: string;
  features?: string[];
};

const UpgradeModal = ({
  isOpen,
  onClose,
  onUpgrade,
  currentPlan = "Free",
  features = [
    "Unlimited workflows",
    "Advanced analytics",
    "Priority support",
    "Custom integrations",
    "Team collaboration",
    "Advanced security features",
  ],
}: UpgradeModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <AlertDialogTitle className="text-xl">
              Upgrade to Pro
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            In Free plan you can create 1 workflow per user. <br /> Unlock
            powerful features and take your workflows to the next level. Upgrade
            from {currentPlan} to Pro plan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {feature.includes("security") ? (
                    <Shield className="h-4 w-4 text-green-500" />
                  ) : feature.includes("analytics") ? (
                    <Zap className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Star className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">$29.99</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Billed monthly. Cancel anytime.
            </p>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Maybe later
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={onUpgrade}
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpgradeModal;
