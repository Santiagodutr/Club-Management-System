/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_PUBLISHABLE_KEY: string
  readonly BACKEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}