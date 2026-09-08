"use server";

import { auth, signIn, signOut } from "@/auth";
import {
  createPasswordResetToken,
  createUser,
  findUserById,
  resetPasswordWithToken,
  updateUserPassword,
  updateUserProfile,
  updateUserSettings,
  verifyPassword,
} from "@/lib/auth/user-store";
import { siteUrl } from "@/lib/site-url";
import { AuthError } from "next-auth";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signUpAction(formData: FormData) {
  const name = formString(formData, "name");
  const email = formString(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !isEmail(email) || password.length < 8) {
    return { error: "Enter your name, a valid email, and a password of at least 8 characters." };
  }

  try {
    await createUser({ name, email, password });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return { error: "An account with that email already exists. Sign in instead." };
    }
    return { error: "Could not create the account. Try again." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw error;
  }
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = formString(formData, "email").toLowerCase();
  if (!email) {
    return { error: "Enter the email on your account." };
  }
  const token = await createPasswordResetToken(email);
  const resetUrl = token ? `${siteUrl()}/reset-password?token=${token.token}` : null;
  return {
    ok: true as const,
    resetUrl,
  };
}

export async function resetPasswordAction(formData: FormData) {
  const token = formString(formData, "token");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (!token) {
    return { error: "This reset link is missing a token. Request a new one." };
  }
  if (password.length < 8) {
    return { error: "Use a password of at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }
  try {
    const user = await resetPasswordWithToken(token, password);
    await signIn("credentials", {
      email: user.email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Password updated, but sign-in failed. Try logging in." };
    }
    if (error instanceof Error && error.message === "INVALID_TOKEN") {
      return { error: "This reset link is invalid or has expired. Request a new one." };
    }
    throw error;
  }
}

export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to update your profile." };
  }
  const name = formString(formData, "name");
  if (!name) {
    return { error: "Name cannot be empty." };
  }
  await updateUserProfile(session.user.id, name);
  return { ok: true as const, name };
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to change your password." };
  }
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const user = await findUserById(session.user.id);
  if (!user) {
    return { error: "Account not found." };
  }
  if (!(await verifyPassword(user, current))) {
    return { error: "Current password is incorrect." };
  }
  if (next.length < 8) {
    return { error: "Use a password of at least 8 characters." };
  }
  if (next !== confirm) {
    return { error: "New passwords do not match." };
  }
  await updateUserPassword(user.id, next);
  return { ok: true as const };
}

export async function updateAccountSettingsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to update settings." };
  }
  await updateUserSettings(session.user.id, {
    notifyProductUpdates: formData.get("notifyProductUpdates") === "on",
    notifyAttemptSummaries: formData.get("notifyAttemptSummaries") === "on",
  });
  return { ok: true as const };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
