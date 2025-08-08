
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase-admin";
import SettingsForm from "./settings-form";

async function getSiteSettings() {
    if (!db) return {};
    const settingsRef = db.collection('settings').doc('siteSettings');
    const settingsSnap = await settingsRef.get();
    const defaults = {
        siteName: 'E-Sports Nepal',
        siteSlogan: 'Your one-stop destination for E-Sports tournaments, community, and stats in Nepal.',
        homePageBackground: 'https://placehold.co/1920x1080.png',
        socialLinks: { 
            twitter: '', 
            discord: 'https://discord.gg/AHxeFxZh', 
            youtube: 'https://www.youtube.com/@esportsnepall', 
            twitch: '', 
            tiktok: 'https://www.tiktok.com/@esportnepall?lang=en' 
        }
    };

    if (!settingsSnap.exists) {
        return defaults;
    }
    
    const data = settingsSnap.data();
    // Merge defaults with existing data to ensure all fields are present
    return {
        ...defaults,
        ...data,
        socialLinks: {
            ...defaults.socialLinks,
            ...(data?.socialLinks || {})
        }
    };
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
