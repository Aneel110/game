
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '../icons/logo';
import { useAuth } from '@/hooks/use-auth';
import { auth, db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';

const navLinks = [
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/streams', label: 'Streams' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin, loading } = useAuth();
  const [siteName, setSiteName] = useState('E-Sports Nepal');
  
  const handleLogout = () => {
    auth.signOut();
  }

  useEffect(() => {
    async function fetchSiteSettings() {
      if (db) {
        const settingsDoc = await getDoc(doc(db, 'settings', 'siteSettings'));
        if (settingsDoc.exists() && settingsDoc.data().siteName) {
          setSiteName(settingsDoc.data().siteName);
        }
      }
    }
    fetchSiteSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled ? 'bg-background/80 backdrop-blur-sm border-b' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">{siteName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
           {user && (
            <Link href="/profile" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              My Profile
            </Link>
          )}
          {isAdmin && (
             <Link href="/admin/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {loading && <div className="h-10 w-36"><Skeleton className='h-full w-full' /></div>}
          {!user && !loading && (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
           {user && !loading && (
             <Button variant="outline" onClick={handleLogout}>Log Out</Button>
           )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center border-b pb-4">
                  <Link href="/" className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold font-headline">{siteName}</span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 py-6">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-lg font-medium text-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  ))}
                   {user && (
                    <Link href="/profile" className="text-lg font-medium text-foreground transition-colors hover:text-primary">
                      My Profile
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="text-lg font-medium text-foreground transition-colors hover:text-primary">
                      Admin
                    </Link>
                  )}
                </nav>
                <div className="mt-auto flex flex-col gap-2">
                  {loading && <div className="h-10 w-full"><Skeleton className='h-full w-full' /></div>}
                  {!user && !loading && (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login">Log In</Link>
                      </Button>
                      <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                  {user && !loading && (
                    <Button variant="outline" onClick={handleLogout}>Log Out</Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
