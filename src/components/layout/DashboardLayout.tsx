import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function DashboardLayout({ title, subtitle, children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}