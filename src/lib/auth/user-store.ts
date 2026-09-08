import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_USER_ID,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_USER_ID,
  type PasswordResetToken,
  type StoredUser,
} from "@/lib/auth/types";

const FILE = path.join("/tmp", "prepharbor-users.json");

type UserFile = {
  users: StoredUser[];
  resetTokens: PasswordResetToken[];
};

const memory = globalThis as unknown as {
  __prepharborUsers?: Map<string, StoredUser>;
  __prepharborResetTokens?: Map<string, PasswordResetToken>;
  __prepharborUsersReady?: Promise<void>;
};

function usersMem() {
  if (!memory.__prepharborUsers) {
    memory.__prepharborUsers = new Map();
  }
  return memory.__prepharborUsers;
}

function tokensMem() {
  if (!memory.__prepharborResetTokens) {
    memory.__prepharborResetTokens = new Map();
  }
  return memory.__prepharborResetTokens;
}

async function readFileStore(): Promise<UserFile> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as UserFile;
    return {
      users: parsed.users ?? [],
      resetTokens: parsed.resetTokens ?? [],
    };
  } catch {
    return { users: [], resetTokens: [] };
  }
}

async function writeFileStore() {
  await mkdir(path.dirname(FILE), { recursive: true });
  const payload: UserFile = {
    users: [...usersMem().values()],
    resetTokens: [...tokensMem().values()],
  };
  await writeFile(FILE, JSON.stringify(payload, null, 2), "utf8");
}

async function hydrate() {
  if (memory.__prepharborUsersReady) {
    return memory.__prepharborUsersReady;
  }
  memory.__prepharborUsersReady = (async () => {
    const stored = await readFileStore();
    for (const user of stored.users) {
      usersMem().set(user.id, user);
    }
    for (const token of stored.resetTokens) {
      tokensMem().set(token.token, token);
    }
    await ensureDemoUser();
    await ensureAdminUser();
  })();
  return memory.__prepharborUsersReady;
}

function withRole(user: StoredUser): StoredUser {
  return { ...user, role: user.role === "admin" ? "admin" : "learner" };
}

async function persistUser(user: StoredUser) {
  const next = withRole(user);
  usersMem().set(next.id, next);
  await writeFileStore();
  if (prisma) {
    try {
      await prisma.user.upsert({
        where: { id: next.id },
        create: {
          id: next.id,
          email: next.email,
          name: next.name,
          passwordHash: next.passwordHash,
        },
        update: {
          email: next.email,
          name: next.name,
          passwordHash: next.passwordHash,
        },
      });
    } catch {
      // Catalog can run without a migrated database.
    }
  }
}

async function ensureDemoUser() {
  const existing =
    [...usersMem().values()].find((user) => user.email === DEMO_EMAIL) ?? usersMem().get(DEMO_USER_ID);
  if (existing) {
    return existing;
  }
  const user: StoredUser = {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    name: "Demo Learner",
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    createdAt: "2026-01-12T09:00:00.000Z",
    notifyProductUpdates: true,
    notifyAttemptSummaries: true,
    role: "learner",
  };
  await persistUser(user);
  return user;
}

async function ensureAdminUser() {
  const existing =
    [...usersMem().values()].find((user) => user.email === ADMIN_EMAIL) ?? usersMem().get(ADMIN_USER_ID);
  if (existing) {
    if (existing.role !== "admin") {
      await persistUser({ ...withRole(existing), role: "admin" });
    }
    return withRole(existing);
  }
  const user: StoredUser = {
    id: ADMIN_USER_ID,
    email: ADMIN_EMAIL,
    name: "PrepHarbor Admin",
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
    createdAt: "2026-01-06T09:00:00.000Z",
    notifyProductUpdates: true,
    notifyAttemptSummaries: false,
    role: "admin",
  };
  await persistUser(user);
  return user;
}

export async function findUserByEmail(email: string) {
  await hydrate();
  const normalized = email.toLowerCase().trim();
  const user = [...usersMem().values()].find((item) => item.email === normalized);
  return user ? withRole(user) : null;
}

export async function findUserById(id: string) {
  await hydrate();
  const user = usersMem().get(id);
  return user ? withRole(user) : null;
}

export async function createUser(input: { name: string; email: string; password: string }) {
  await hydrate();
  const email = input.email.toLowerCase().trim();
  if (await findUserByEmail(email)) {
    throw new Error("EMAIL_TAKEN");
  }
  if (input.password.length < 8) {
    throw new Error("PASSWORD_SHORT");
  }
  const user: StoredUser = {
    id: `usr_${randomBytes(8).toString("hex")}`,
    email,
    name: input.name.trim() || "Learner",
    passwordHash: await bcrypt.hash(input.password, 10),
    createdAt: new Date().toISOString(),
    notifyProductUpdates: true,
    notifyAttemptSummaries: true,
    role: "learner",
  };
  await persistUser(user);
  return user;
}

export async function verifyPassword(user: StoredUser, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

export async function updateUserProfile(id: string, name: string) {
  await hydrate();
  const user = usersMem().get(id);
  if (!user) {
    throw new Error("NOT_FOUND");
  }
  const next = { ...user, name: name.trim() || user.name };
  await persistUser(next);
  return next;
}

export async function updateUserPassword(id: string, password: string) {
  await hydrate();
  const user = usersMem().get(id);
  if (!user) {
    throw new Error("NOT_FOUND");
  }
  if (password.length < 8 && !(id === DEMO_USER_ID && password === DEMO_PASSWORD)) {
    throw new Error("PASSWORD_SHORT");
  }
  const next = { ...user, passwordHash: await bcrypt.hash(password, 10) };
  await persistUser(next);
  return next;
}

export async function updateUserSettings(
  id: string,
  settings: { notifyProductUpdates: boolean; notifyAttemptSummaries: boolean },
) {
  await hydrate();
  const user = usersMem().get(id);
  if (!user) {
    throw new Error("NOT_FOUND");
  }
  const next = { ...user, ...settings };
  await persistUser(next);
  return next;
}

export async function createPasswordResetToken(email: string) {
  await hydrate();
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }
  for (const [key, value] of tokensMem()) {
    if (value.email === user.email) {
      tokensMem().delete(key);
    }
  }
  const token = randomBytes(24).toString("hex");
  const record: PasswordResetToken = {
    token,
    email: user.email,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
  tokensMem().set(token, record);
  await writeFileStore();
  return record;
}

export async function consumePasswordResetToken(token: string) {
  await hydrate();
  const record = tokensMem().get(token);
  if (!record) {
    return null;
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    tokensMem().delete(token);
    await writeFileStore();
    return null;
  }
  return record;
}

export async function resetPasswordWithToken(token: string, password: string) {
  const record = await consumePasswordResetToken(token);
  if (!record) {
    throw new Error("INVALID_TOKEN");
  }
  const user = await findUserByEmail(record.email);
  if (!user) {
    throw new Error("INVALID_TOKEN");
  }
  await updateUserPassword(user.id, password);
  tokensMem().delete(token);
  await writeFileStore();
  return user;
}

export async function listUsers() {
  await hydrate();
  return [...usersMem().values()]
    .map(withRole)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateUserRole(id: string, role: "admin" | "learner") {
  await hydrate();
  const user = usersMem().get(id);
  if (!user) {
    throw new Error("NOT_FOUND");
  }
  if (role === "learner") {
    const admins = [...usersMem().values()].filter((item) => withRole(item).role === "admin");
    if (admins.length === 1 && admins[0]?.id === id) {
      throw new Error("LAST_ADMIN");
    }
  }
  const next = withRole({ ...user, role });
  await persistUser(next);
  return next;
}
