import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Settings</CardTitle>
        <CardDescription>
          Manage site-wide settings and configurations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Global settings form will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
