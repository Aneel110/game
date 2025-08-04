
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase-admin";
import SettingsForm from "./settings-form";

async function getSiteSettings() {
    if (!db) return {};
    const settingsRef = db.collection('settings').doc('siteSettings');
    const settingsSnap = await settingsRef.get();
    return settingsSnap.exists ? settingsSnap.data() : {};
}

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Manage site-wide settings and configurations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsForm defaultValues={settings} />
      </CardContent>
    </Card>
  );
}
