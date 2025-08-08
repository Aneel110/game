

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, auth } from "@/lib/firebase-admin";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, UserCheck, UserX } from "lucide-react";
import UserActions from "./user-actions";

async function getUsers() {
    if (!db || !auth) {
        return { error: "Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY." };
    }
    
    try {
        const usersSnapshot = await db.collection('users').get();
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const authUsers = await Promise.all(
            usersData.map(async (user) => {
                try {
                    const authUser = await auth.getUser(user.id);
                    return { ...user, disabled: authUser.disabled };
                } catch (error) {
                    console.warn(`Could not fetch auth record for user ${user.id}`, error);
                    return { ...user, disabled: false }; // Assume enabled if auth record is missing
                }
            })
        );
        return { users: authUsers };

    } catch(e: any) {
        return { error: e.message };
    }
}

const getRoleBadge = (role: string) => {
    switch (role) {
        case 'admin':
            return <Badge variant="destructive">Admin</Badge>;
        case 'moderator':
            return <Badge variant="outline" className="border-blue-500 text-blue-500">Moderator</Badge>;
        case 'user':
            return <Badge variant="secondary">User</Badge>;
        default:
            return <Badge>{role}</Badge>;
    }
}

const getStatusBadge = (disabled: boolean) => {
    return disabled ? (
        <Badge variant="outline" className="text-red-400 border-red-400">
            <UserX className="w-3.5 h-3.5 mr-1" />
            Disabled
        </Badge>
    ) : (
        <Badge variant="outline" className="text-green-400 border-green-400">
             <UserCheck className="w-3.5 h-3.5 mr-1" />
            Enabled
        </Badge>
    )
}

export default async function AdminUsersPage() {
    const { users, error } = await getUsers();

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Server Configuration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users && users.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell>{getStatusBadge(user.disabled)}</TableCell>
                                <TableCell className="text-right">
                                    <UserActions userId={user.id} currentRole={user.role} isDisabled={user.disabled} />
                                </TableCell>
                            </TableRow>
                        ))}
                         {(!users || users.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
