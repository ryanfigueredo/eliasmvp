'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function Sidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn(
        'group/sidebar flex flex-col w-64 transition-all bg-[#121212] text-white',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'h-14 px-4 flex items-center border-b border-zinc-800',
        className,
      )}
      {...props}
    />
  )
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-auto px-4 py-3 border-t border-zinc-800', className)}
      {...props}
    />
  )
}

export function SidebarItem({
  icon,
  children,
  className,
  ...props
}: {
  icon: React.ReactNode
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm py-2 px-4 rounded hover:bg-zinc-800 transition-colors cursor-pointer',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </div>
  )
}

export function SidebarList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <nav className={cn('space-y-1 mt-4', className)}>{children}</nav>
}

export function SidebarSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('mb-6', className)}>{children}</div>
}

export function SidebarTrigger({
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn('hover:bg-zinc-800 p-2 rounded transition-all', className)}
      aria-label="Toggle Sidebar"
      {...props}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 5h14M3 10h14M3 15h14" />
      </svg>
    </button>
  )
}
