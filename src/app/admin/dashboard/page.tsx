

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, Trophy, DollarSign, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase-admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
    if (!db) {
        return { error: "Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY." };
    }

    try {
        const usersSnapshot = await db.collection('users').get();
        const tournamentsSnapshot = await db.collection('tournaments').get();

        const now = new Date();
        const activeTournaments = tournamentsSnapshot.docs.filter(doc => {
            const data = doc.data();
            if (!data.date) return false;
            // The date can be a string (from form) or a Timestamp (from Firestore)
            const tournamentDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
            return tournamentDate > now;
        }).length;

        const totalPrizeMoney = tournamentsSnapshot.docs.reduce((total, doc) => {
            const data = doc.data();
            const prizeDistribution = data.prizeDistribution || {};
            const tournamentTotal = Object.values(prizeDistribution).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
            return total + tournamentTotal;
        }, 0);

        return {
            stats: {
                totalUsers: usersSnapshot.size,
                activeTournaments: activeTournaments,
                prizesRedeemed: 0, // Placeholder
                totalPrizeMoney: totalPrizeMoney,
            }
        };
    } catch (e: any) {
        console.error("Error fetching dashboard stats:", e);
        return { error: `Failed to fetch dashboard data: ${e.message}` };
    }
}


export default async function AdminDashboardPage() {
  const { stats, error } = await getDashboardStats();

  if (error) {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Server Configuration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }
  
  const statsCards = [
    { title: "Total Users", value: stats?.totalUsers.toLocaleString() || '0', icon: Users },
    { title: "Active Tournaments", value: stats?.activeTournaments.toLocaleString() || '0', icon: Gamepad2 },
    { title: "Prizes Redeemed", value: stats?.prizesRedeemed.toLocaleString() || '0', icon: Trophy },
    { title: "Total Prize Money", value: `Rs ${stats?.totalPrizeMoney.toLocaleString() || '0'}`, icon: DollarSign },
  ]

  return (
    <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat) => (
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
