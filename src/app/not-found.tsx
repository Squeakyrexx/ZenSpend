import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <Rocket className="h-24 w-24 text-primary mb-4" />
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        404 - Page Not Found
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Oops! Looks like you've ventured into uncharted territory.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild>
          <Link href="/">Go Back to Dashboard</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/transactions">View Transactions &rarr;</Link>
        </Button>
      </div>
    </div>
  );
}
