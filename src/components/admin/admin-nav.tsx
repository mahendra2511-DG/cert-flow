"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  BookOpen,
  ClipboardList,
  FileQuestion,
  FileText,
  LayoutDashboard,
  Library,
  Receipt,
  Settings,
  Users,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean };

const dashboard: NavItem = { href: "/admin", label: "Dashboard", icon: LayoutDashboard };

const content: NavItem[] = [
  { href: "/admin/content", label: "Content hub", icon: Layers },
  { href: "/admin/providers", label: "Providers", icon: BookOpen },
  { href: "/admin/certifications", label: "Certifications", icon: BookOpen },
  { href: "/admin/exams", label: "Exams", icon: Library },
  { href: "/admin/questions", label: "Questions", icon: FileQuestion },
  { href: "/admin/papers", label: "Papers", icon: ClipboardList },
  { href: "/admin/pdfs", label: "PDFs", icon: FileText },
];

const sales: NavItem[] = [
  { href: "/admin/orders", label: "Orders", icon: Receipt, adminOnly: true },
  { href: "/admin/payments", label: "Payments", icon: Receipt, adminOnly: true },
];

const rest: NavItem[] = [
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ role = "admin" }: { role?: "admin" | "editor" | "learner" }) {
  const pathname = usePathname();
  const allow = (item: NavItem) => !item.adminOnly || role === "admin";

  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      <NavLink item={dashboard} pathname={pathname} />
      <p className="mt-4 mb-1 hidden px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:block">
        Content
      </p>
      {content.filter(allow).map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
      {role === "admin" ? (
        <>
          <p className="mt-4 mb-1 hidden px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:block">
            Sales
          </p>
          {sales.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </>
      ) : null}
      <p className="mt-4 mb-1 hidden px-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:block">
        Account
      </p>
      {rest.filter(allow).map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active =
    item.href === "/admin"
      ? pathname === "/admin"
      : item.href === "/admin/content"
        ? pathname.startsWith("/admin/content")
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href as Route}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {item.label}
    </Link>
  );
}
