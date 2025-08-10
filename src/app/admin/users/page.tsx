
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, UserCheck, UserX, Search, CheckCircle2, XCircle } from "lucide-react";
import UserActions from "./user-actions";
import { listAllUsersWithVerification } from "@/lib/actions";
import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type User = {
    id: string;
    displayName: string;
    email: string;
    role: 'admin' | 'moderator' | 'user';
    disabled: boolean;
    emailVerified: boolean;
    isNew: boolean;
    createdAt?: string;
};

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

const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
        <Badge variant="outline" className="text-green-500 border-green-500">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Verified
        </Badge>
    ) : (
        <Badge variant="destructive">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Not Verified
        </Badge>
    )
}

function UserTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Email Verification</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const result = await listAllUsersWithVerification();
                if (result.success && result.users) {
                    setUsers(result.users);
                } else {
                    setError(result.error || "An unknown error occurred.");
                }
            } catch (e: any) {
                 setError("Failed to fetch users from the server.");
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);
    
    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                if (filter === 'new') return user.isNew;
                if (filter === 'enabled') return !user.disabled;
                if (filter === 'disabled') return user.disabled;
                if (filter === 'verified') return user.emailVerified;
                if (filter === 'not_verified') return !user.emailVerified;
                return true;
            })
            .filter(user => 
                user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, searchTerm, filter]);


    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Server Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>A list of all users in your database.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter users" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="new">New Users</SelectItem>
                            <SelectItem value="enabled">Enabled</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                             <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="not_verified">Not Verified</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {loading ? <UserTableSkeleton /> : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Email Verification</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>{user.displayName}</span>
                                            {user.isNew && <Badge>New</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{getVerificationBadge(user.emailVerified)}</TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>{getStatusBadge(user.disabled)}</TableCell>
                                    <TableCell className="text-right">
                                        <UserActions userId={user.id} currentRole={user.role} isDisabled={user.disabled} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
