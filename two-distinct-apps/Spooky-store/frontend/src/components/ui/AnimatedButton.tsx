"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { buttonVariants } from "./button";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

export interface AnimatedButtonProps 
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  asChild?: boolean;
  animationType?: "scale" | "bounce" | "pulse" | "none";
}

const animationVariants = {
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  },
  bounce: {
    whileHover: { y: -2 },
    whileTap: { y: 0 }
  },
  pulse: {
    whileHover: { scale: [1, 1.05, 1] }
  },
  none: {}
};

export function AnimatedButton({
  className,
  variant,
  size,
  children,
  loading = false,
  loadingText,
  animationType = "scale",
  disabled,
  ...props
}: AnimatedButtonProps) {
  const animations = animationVariants[animationType];
  
  const getTransition = () => {
    switch (animationType) {
      case "scale":
        return { type: "spring" as const, stiffness: 400, damping: 17 };
      case "bounce":
        return { type: "spring" as const, stiffness: 400, damping: 10 };
      case "pulse":
        return { duration: 0.3 };
      default:
        return undefined;
    }
  };
  
  return (
    <motion.button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      transition={getTransition()}
      {...animations}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <LoadingSpinner 
            size="sm" 
            color={variant === "default" ? "white" : "primary"} 
          />
          <span>{loadingText || "Loading..."}</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}