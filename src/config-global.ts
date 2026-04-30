import packageJson from '../package.json';

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  localServerUrl: string;
  imageServerUrl: string;
  isStaticExport: boolean;
};

export const CONFIG: ConfigValue = {
  appName: 'Kingwangjjang',
  appVersion: packageJson.version,
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.마약.kr',
  localServerUrl: process.env.NEXT_PUBLIC_LOCAL_SERVER_URL || 'http://localhost:33330',
  imageServerUrl: process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || 'https://images.마약.kr',
  isStaticExport: JSON.parse(process.env.NEXT_PUBLIC_BUILD_STATIC_EXPORT ?? 'false'),
};
