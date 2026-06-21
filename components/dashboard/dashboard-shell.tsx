"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Blocks,
  FileText,
  Grid2X2,
  LogOut,
  Menu,
  Settings,
  Shapes,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn, getName, initials } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: Grid2X2 },
  { label: "User List", href: "/users", icon: Blocks },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Interest", href: "/interests", icon: Shapes },
  { label: "Subscriber", href: "/subscriptions", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

function Logo() {
  return (
    <Link href="/" className="flex flex-col items-center gap-1 text-black">
      <span className="relative h-5 w-5">
        <span className="absolute left-2 top-0 h-3 w-1 rotate-45 rounded-full bg-yellow-400" />
        <span className="absolute left-1 top-2 h-2 w-2 rotate-45 border-2 border-orange-500" />
        <span className="absolute left-3 top-2 h-2 w-2 rotate-45 border-2 border-cyan-500" />
      </span>
      <span className="text-3xl font-semibold leading-none tracking-tight">YERR</span>
    </Link>
  );
}

function SidebarContent({
  onNavigate,
  onLogout,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-col bg-sidebar px-8 py-16">
      <Logo />
      <nav className="mt-24 flex flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-14 items-center gap-3 rounded px-3 text-base font-medium transition-colors",
                active ? "bg-black text-white" : "text-black hover:bg-white/40"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        className="mt-auto flex items-center gap-3 px-3 text-base font-medium text-red-600"
        onClick={onLogout}
      >
        <LogOut className="size-5" />
        Logout
      </button>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { data: session } = useSession();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
    enabled: Boolean(session?.accessToken),
  });
  const userName = profile ? getName(profile) : session?.user?.name || "Mr. Raja";
  const email = session?.user?.email || "@admin";
  const avatarUrl = profile?.avatar?.url || session?.user?.image;
  const requestLogout = () => {
    setOpen(false);
    setLogoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-sidebar md:grid md:grid-cols-[310px_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[310px] md:block">
        <SidebarContent onLogout={requestLogout} />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/30 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          aria-label="Close menu"
          className="absolute right-4 top-4 z-10 rounded bg-white/70 p-2"
          onClick={() => setOpen(false)}
        >
          <X className="size-5" />
        </button>
        <SidebarContent onNavigate={() => setOpen(false)} onLogout={requestLogout} />
      </aside>

      <main className="min-h-screen bg-background md:col-start-2">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between bg-sidebar px-5 md:h-[100px] md:justify-end md:px-10">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-base font-medium leading-tight">{userName}</p>
              <p className="text-sm leading-tight text-muted-foreground">
                {email === "@admin" ? email : "@admin"}
              </p>
            </div>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={userName}
                className="size-12 rounded-full object-cover"
              />
            ) : (
              <div className="grid size-12 place-items-center rounded-full bg-white text-sm font-semibold">
                {initials(userName)}
              </div>
            )}
          </div>
        </header>
        <div className="mx-auto w-full px-4 py-8 md:px-12 md:py-12">
          {children}
        </div>
      </main>

      {logoutOpen && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-black/35 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-dashboard">
            <h2 id="logout-title" className="text-2xl font-semibold">
              Logout?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Are you sure you want to logout from the admin dashboard?
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLogoutOpen(false)}
              >
                No
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
