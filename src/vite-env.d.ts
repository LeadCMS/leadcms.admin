interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly CORE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
