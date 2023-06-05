export interface SMLType {
  serverName?: string;
  address: string;
  port: number;
  user: string;
  select: 'password' | 'keygen';
  file?: string;
  password?: string;
  comment?: string;
  format?: 'RFC4716' | 'PKCS8' | 'PEM';
  keyType?: boolean;
  time?: number;
  [key: string]: any;
}
