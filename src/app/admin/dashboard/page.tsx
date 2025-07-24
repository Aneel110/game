import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, Trophy, DollarSign } from "lucide-react";
import SeedDatabaseButton from "./seed-button";

const stats = [
    { title: "Total Users", value: "12,345", icon: Users },
    { title: "Active Tournaments", value: "6", icon: Gamepad2 },
    { title: "Prizes Redeemed", value: "1,204", icon: Trophy },
    { title: "Total Prize Money", value: "$250,000", icon: DollarSign },
]

export default function AdminDashboardPage() {
  return (
    <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent>
                   <SeedDatabaseButton />
                </CardContent>
            </Card>
        </div>

        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Activity feed will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
