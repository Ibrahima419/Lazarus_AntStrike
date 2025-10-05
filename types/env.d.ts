/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENVIRONMENT: string
  readonly VITE_ENABLE_MOCK_DATA: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_MISP_API_KEY: string
  readonly VITE_VIRUSTOTAL_API_KEY: string
  readonly VITE_SLACK_WEBHOOK_URL: string
  readonly VITE_ENABLE_CSP: string
  readonly VITE_ENABLE_HSTS: string
  readonly VITE_TARANIS_ENABLED: string
  readonly VITE_TARANIS_API_URL: string
  readonly VITE_TARANIS_API_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}