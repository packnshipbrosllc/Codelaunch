"use client"

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Rocket, CreditCard } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[99999] bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
            <Rocket className="w-6 h-6" />
            <span className="text-xl font-bold">CodeLaunch</span>
          </Link>

          {/* Navigation Links and User Button */}
          <div className="flex items-center gap-4">
            {/* Direct Subscription Link */}
            <Link 
              href="/dashboard/subscription"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              <span className="hidden sm:inline">Subscription</span>
            </Link>
            
            {/* User Button */}
            <UserButton 
              afterSignOutUrl="/"
              userProfileMode="navigation"
              userProfileUrl="/user-profile"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}
