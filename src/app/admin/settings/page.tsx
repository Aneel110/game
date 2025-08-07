
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase-admin";
import SettingsForm from "./settings-form";

async function getSiteSettings() {
    if (!db) return {};
    const settingsRef = db.collection('settings').doc('siteSettings');
    const settingsSnap = await settingsRef.get();
    if (!settingsSnap.exists) {
        return {
            siteName: 'E-Sports Nepal',
            siteSlogan: 'Your one-stop destination for E-Sports tournaments, community, and stats in Nepal.',
            homePageBackground: 'https://placehold.co/1920x1080.png',
            socialLinks: { twitter: '#', discord: '#', youtube: '#', twitch: '#' }
        };
    }
    return settingsSnap.data();
}

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Manage site-wide settings and configurations. Changes made here will reflect across the entire website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SettingsForm defaultValues={settings} />
      </CardContent>
    </Card>
  );
}
