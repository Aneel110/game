
'use client';

import Link from 'next/link';
import { Logo } from '../icons/logo';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const defaultSocialLinks = [
  { name: 'Twitter', href: '#' },
  { name: 'Discord', href: '#' },
  { name: 'YouTube', href: '#' },
  { name: 'Twitch', href: '#' },
];

const footerLinks = [
  { name: 'About', href: '#' },
  { name: 'Support', href: '#' },
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms of Service', href: '#' },
];

function AdminFooterLink() {
    const { isAdmin } = useAuth();
    if (!isAdmin) return null;

    return (
        <div>
            <h3 className="font-semibold mb-4">Admin</h3>
            <ul className="space-y-2">
                <li>
                    <Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-primary">
                        Admin Panel
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default function Footer() {
  const [settings, setSettings] = useState({ 
      siteName: 'E-Sports Nepal', 
      socialLinks: { twitter: '#', discord: '#', youtube: '#', twitch: '#' } 
  });

  useEffect(() => {
    async function fetchSiteSettings() {
      if (db) {
        const settingsDoc = await getDoc(doc(db, 'settings', 'siteSettings'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSettings({
            siteName: data.siteName || 'E-Sports Nepal',
            socialLinks: data.socialLinks || { twitter: '#', discord: '#', youtube: '#', twitch: '#' }
          });
        }
      }
    }
    fetchSiteSettings();
  }, []);

  const socialLinks = [
      { name: 'Twitter', href: settings.socialLinks.twitter || '#' },
      { name: 'Discord', href: settings.socialLinks.discord || '#' },
      { name: 'YouTube', href: settings.socialLinks.youtube || '#' },
      { name: 'Twitch', href: settings.socialLinks.twitch || '#' },
  ].filter(link => link.href && link.href !== '#');

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline">{settings.siteName}</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              The ultimate hub for competitive players. Join tournaments, climb the leaderboards, and become a legend.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="font-semibold mb-4">Community</h3>
              {socialLinks.length > 0 ? (
                <ul className="space-y-2">
                    {socialLinks.map((link) => (
                    <li key={link.name}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary" target="_blank" rel="noopener noreferrer">
                        {link.name}
                        </Link>
                    </li>
                    ))}
                </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No social links set.</p>
                )}
            </div>
            <AdminFooterLink />
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
