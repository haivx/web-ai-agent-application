export interface NextConfig {
  [key: string]: unknown;
}

export default function createApp(config?: NextConfig): NextConfig;
