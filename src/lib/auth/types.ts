export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  notifyProductUpdates: boolean;
  notifyAttemptSummaries: boolean;
};

export type PasswordResetToken = {
  token: string;
  email: string;
  expiresAt: string;
};

export const DEMO_USER_ID = "demo-user";
export const DEMO_EMAIL = "demo@prepharbor.test";
export const DEMO_PASSWORD = "demo";
