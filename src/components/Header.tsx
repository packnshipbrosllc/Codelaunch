import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Header({ title, showBackButton = false, backUrl = '/dashboard' }: HeaderProps) {
  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link 
              href={backUrl}
              className="text-gray-600 hover:text-gray-900 transition"
            >
              ← Back
            </Link>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}


