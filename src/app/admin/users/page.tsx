import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase-admin";
import { Badge } from "@/components/ui/badge";
import RoleSwitcher from "./role-switcher";

async function getUsers() {
    const usersSnapshot = await db.collection('users').get();
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    const users = await getUsers();

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
                        {users.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell className="text-right">
                                    <RoleSwitcher userId={user.id} currentRole={user.role} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
