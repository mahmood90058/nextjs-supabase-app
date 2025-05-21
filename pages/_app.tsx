// pages/_app.tsx
import '@/styles/app.css'
import { useEffect, useState } from 'react'
import { AppProps } from 'next/app'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Database } from '@/lib/schema'
import Notification from '@/components/Notification'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient<Database>())

  useEffect(() => {
    // Set session from sessionStorage on initial mount
    const storedSession = sessionStorage.getItem('supabase.session')
    if (storedSession) {
      supabaseClient.auth.setSession(JSON.parse(storedSession))
    }

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        sessionStorage.setItem('supabase.session', JSON.stringify(session))
      } else {
        sessionStorage.removeItem('supabase.session')
      }
    });

    

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession} // ✅ Important
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}
