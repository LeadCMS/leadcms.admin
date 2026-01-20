interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add other VITE_ prefixed variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
