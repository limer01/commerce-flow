import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Landing page: brand hero with a call-to-action to browse products.
export default function Home() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
        Streetwear Store
      </p>
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
        Everyday streetwear, built to last.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Hoodies, tees, cargos, sneakers and more — curated essentials for your
        rotation. No login required to browse.
      </p>
      <div className="mt-10">
        <Button asChild size="lg">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    </main>
  );
}
