
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { Badge } from "@/components/ui/badge";
import RoleSwitcher from "./role-switcher";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

async function getUsers() {
    if (!db) {
        return { error: "Firebase Admin is not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY." };
    }
    const usersSnapshot = await db.collection('users').get();
    return { users: usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
}

const getRoleBadge = (role: string) => {
    switch (role) {
        case 'admin':
            return <Badge variant="destructive">Admin</Badge>;
        case 'user':
            return <Badge variant="secondary">User</Badge>;
        default:
            return <Badge>{role}</Badge>;
    }
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
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users && users.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell className="text-right">
                                    <RoleSwitcher userId={user.id} currentRole={user.role} />
                                </TableCell>
                            </TableRow>
                        ))}
                         {(!users || users.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
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
