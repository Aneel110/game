
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
import { LayoutDashboard, Gamepad2, Users, Trophy, Settings, LogOut, ShieldAlert, Clapperboard, Newspaper } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";

// Define roles for each navigation item
const allAdminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'moderator'] },
  { href: "/admin/tournaments", label: "Tournaments", icon: Gamepad2, roles: ['admin', 'moderator'] },
  { href: "/admin/news", label: "News", icon: Newspaper, roles: ['admin', 'moderator'] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ['admin'] },
  { href: "/admin/streams", label: "Streams", icon: Clapperboard, roles: ['admin'] },
  { href: "/admin/prizes", label: "Prizes", icon: Trophy, roles: ['admin'] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ['admin'] },
];

function AdminNavContent({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, isModerator } = useAuth();
    const pathname = usePathname();
    
    // Filter nav items based on user role
    const adminNavItems = allAdminNavItems.filter(item => {
        if (isAdmin) return item.roles.includes('admin');
        if (isModerator) return item.roles.includes('moderator');
        return false;
    });
    
    const currentPage = adminNavItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard';

    return (
        <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Logo className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-headline font-semibold">Admin Panel</h2>
                </div>
                 <SidebarTrigger className="hidden md:flex" />
              </div>
            </SidebarHeader>
            <SidebarContent>
            <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <Link href={item.href}>
                      <SidebarMenuButton isActive={pathname.startsWith(item.href)}>
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
                  <p className="text-xs text-muted-foreground">{isAdmin ? 'Admin' : 'Moderator'}</p>
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
              <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden"/>
                <h1 className="text-xl font-headline font-semibold">{currentPage}</h1>
              </div>
            </header>
            <div className="p-4">{children}</div>
        </SidebarInset>
        </SidebarProvider>
    )
}

function AccessDenied() {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <ShieldAlert className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl text-destructive">
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.</p>
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
        <div className="flex h-screen w-full">
            <div className="w-64 border-r p-4 hidden md:block">
                 <Skeleton className="h-10 w-full mb-8" />
                 <div className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                 </div>
            </div>
             <div className="flex-1 p-4">
                <Skeleton className="h-12 w-1/3 mb-8" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isModerator, loading } = useAuth();

  if (loading) {
      return <LoadingSkeleton />;
  }

  // Grant access if the user is either an admin or a moderator
  if (user && (isAdmin || isModerator)) {
    return <AdminNavContent>{children}</AdminNavContent>;
  }
  
  // If not authenticated or doesn't have the right role, deny access
  return <AccessDenied />;
}
