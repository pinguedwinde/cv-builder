"use client";

import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { AIProviderSettings } from "./AIProviderSettings";

interface NavbarProps {
  title?: string;
  actions?: React.ReactNode;
  showBack?: boolean;
  backHref?: string;
}

export function Navbar({ title, actions, showBack, backHref = "/" }: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 glass border-b"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Button variant="ghost" size="icon" asChild className="shrink-0 h-8 w-8">
              <Link href={backHref}>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-4 h-4" />
            </span>
            <span className="font-bold text-sm hidden sm:block">CV Builder</span>
          </Link>
          {title && (
            <>
              <span className="text-border hidden sm:block">/</span>
              <span className="font-medium text-sm truncate text-muted-foreground">{title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <AIProviderSettings />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
