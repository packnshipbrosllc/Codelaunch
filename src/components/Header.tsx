import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Header({ title, showBackButton = false, backUrl = '/dashboard' }: HeaderProps) {
  return (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link 
              href={backUrl}
              className="text-purple-400 hover:text-purple-300 transition"
            >
              ← Back
            </Link>
          )}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Subscription Button */}
          <Link 
            href="/dashboard/subscription"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span className="hidden sm:inline">Subscription</span>
          </Link>
          
          {/* User Button */}
          <UserButton 
            afterSignOutUrl="/"
            userProfileMode="navigation"
            userProfileUrl="/user-profile"
          />
        </div>
      </div>
    </header>
  );
}


