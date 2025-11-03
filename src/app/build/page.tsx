// src/app/build/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import InteractiveBuilder from '@/components/InteractiveBuilder';

export default async function BuildPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in?redirect=/build');
  }

  return (
    <div className="h-screen">
      <InteractiveBuilder userId={userId} />
    </div>
  );
}

