'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Gamepad2, Users, Trophy, Settings, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tournaments", label: "Tournaments", icon: Gamepad2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/prizes", label: "Prizes", icon: Trophy },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminNav() {
  const { user, loading } = useAuth();
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-headline font-semibold">Admin Panel</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || "https://placehold.co/40x40"} />
              <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="text-sm font-semibold">{user?.displayName || "Admin User"}</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <LogOut className="h-4 w-4" />
                </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
       <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-xl font-headline font-semibold">Dashboard</h1>
        </header>
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AccessDenied() {
    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl text-destructive">
                        <ShieldAlert className="h-8 w-8" />
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">You do not have permission to view this page. Please contact an administrator if you believe this is an error.</p>
                    <Button asChild className="w-full mt-6">
                        <Link href="/">Return to Homepage</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="flex items-center justify-center h-screen">
           <Skeleton className="w-full max-w-md h-64" />
        </div>
    )
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
      return <LoadingSkeleton />;
  }

  if(!isAdmin) {
      return <AccessDenied />
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-headline font-semibold">Admin Panel</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                  <SidebarMenuButton>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="text-sm font-semibold">Admin User</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                    <LogOut className="h-4 w-4" />
                </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-xl font-headline font-semibold">Dashboard</h1>
        </header>
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
