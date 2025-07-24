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
import { LayoutDashboard, Gamepad2, Users, Trophy, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tournaments", label: "Tournaments", icon: Gamepad2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/prizes", label: "Prizes", icon: Trophy },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
