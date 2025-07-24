import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
            <div className="flex justify-center mb-4">
                <FileQuestion className="h-16 w-16 text-primary" />
            </div>
          <CardTitle className="text-3xl font-headline">404 - Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
          </p>
          <Button asChild>
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
