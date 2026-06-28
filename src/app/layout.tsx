import { NotificationToast } from '@/profile-app/components/NotificationToast'
import { PushNotificationRegistrar } from '@/profile-app/components/PushNotificationRegistrar'
import ClientProviders from '@/providers/ClientProviders'
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
          {children}
          <NotificationToast />
        </ClientProviders>
      </body>
    </html>
  )
}
