export interface SMLType {
  time: number;
  serverName: string;
  address: string;
  port: number;
  user: string;
  file: string;
  password: string;
  comment: string;
  format: 'RFC4716' | 'PKCS8' | 'PEM';
  keyType: boolean;
  [key: string]: any;
}
