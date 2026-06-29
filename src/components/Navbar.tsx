"use client";

import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { AIProviderSettings } from "./AIProviderSettings";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface NavbarProps {
  /** Breadcrumb trail. Last item is the current page (no href needed). */
  breadcrumbs?: BreadcrumbItem[];
  /** Quick-nav pills shown after the breadcrumb for switching between pages. */
  navLinks?: NavLink[];
  /** Small subtitle shown next to the logo (e.g. CV count on home page). */
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Navbar({ breadcrumbs, navLinks, subtitle, actions }: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 glass border-b"
    >
      {/* Gradient accent line at top */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-violet-500 to-indigo-500" />

      <div className="max-w-screen-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: logo + breadcrumb + nav links */}
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-500 text-white shadow-sm group-hover:shadow-md transition-shadow">
              <FileText className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-sm hidden sm:block bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              CV Builder
            </span>
          </Link>

          {/* Subtitle (e.g. CV count) */}
          {subtitle && !breadcrumbs && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full hidden sm:inline-flex items-center">
              {subtitle}
            </span>
          )}

          {/* Breadcrumb items */}
          {breadcrumbs && breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-2 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-[160px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-foreground truncate max-w-[160px]">
                  {item.label}
                </span>
              )}
            </span>
          ))}

          {/* Quick-nav pills */}
          {navLinks && navLinks.length > 0 && (
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                    link.active
                      ? "bg-gradient-to-r from-primary to-violet-500 text-white border-transparent font-semibold shadow-sm"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/50"
                  }`}
                >
                  {link.icon && <span className="w-3 h-3">{link.icon}</span>}
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: actions + settings */}
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <AIProviderSettings />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
