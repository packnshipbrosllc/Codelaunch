"use client"

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Rocket } from 'lucide-react'

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

          {/* User Button (Sign out dropdown) */}
          <div className="flex items-center gap-4">
            <UserButton 
              afterSignOutUrl="/"
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
