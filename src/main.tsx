import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SupabaseProvider } from './providers/SupabaseProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SupabaseProvider>
      <App />
    </SupabaseProvider>
  </React.StrictMode>,
) 