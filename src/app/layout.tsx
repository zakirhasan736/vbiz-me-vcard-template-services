import ClientProviders from '@/providers/ClientProviders'
import { PushNotificationRegistrar } from '@/profile-app/components/PushNotificationRegistrar'
import { PushUpdateWatcher } from '@/profile-app/components/PushUpdateWatcher'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vbiz',
  description: 'Your digital business profile',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ClientProviders>
          <PushNotificationRegistrar />
          <PushUpdateWatcher />
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
