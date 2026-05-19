export interface AuthUser {
  userId: string;
  tokenType: 'access' | 'refresh';
}
