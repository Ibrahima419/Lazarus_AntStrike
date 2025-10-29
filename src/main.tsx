import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './AppRoutes'
import '../styles/globals.css'
import '../styles/scrollbar.css'
import { QueryProvider } from './providers/query-provider'
import { AuthProvider } from './providers/auth-provider'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right" 
          theme="dark"
          richColors
          expand={false}
          closeButton
        />
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>,
)