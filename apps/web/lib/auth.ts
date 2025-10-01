export interface AuthenticatedUser {
  id: string;
}

export async function authUser(): Promise<AuthenticatedUser> {
  // TODO: Replace with NextAuth integration.
  return { id: '00000000-0000-0000-0000-000000000001' };
}
