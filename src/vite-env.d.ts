/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  /** 0-1 probability used to randomly fail mock API calls (demonstrates error states). */
  readonly VITE_MOCK_FAILURE_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
