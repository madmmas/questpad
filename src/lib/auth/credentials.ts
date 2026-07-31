import type { Role, SessionUser } from "./types";

export type DemoAccount = {
  username: string;
  password: string;
  role: Role;
};

const DEFAULT_ACCOUNTS: DemoAccount[] = [
  { username: "parent", password: "parent123", role: "parent" },
  { username: "child", password: "child123", role: "child" },
];

function accountFromEnv(
  userKey: string,
  passwordKey: string,
  role: Role,
  fallback: DemoAccount,
): DemoAccount {
  return {
    username: process.env[userKey]?.trim() || fallback.username,
    password: process.env[passwordKey] || fallback.password,
    role,
  };
}

export function getDemoAccounts(): DemoAccount[] {
  return [
    accountFromEnv(
      "DEMO_PARENT_USER",
      "DEMO_PARENT_PASSWORD",
      "parent",
      DEFAULT_ACCOUNTS[0],
    ),
    accountFromEnv(
      "DEMO_CHILD_USER",
      "DEMO_CHILD_PASSWORD",
      "child",
      DEFAULT_ACCOUNTS[1],
    ),
  ];
}

/**
 * Authenticate a demo login. Role comes from the matched account credentials.
 */
export function authenticateDemoLogin(input: {
  username: string;
  password: string;
}): SessionUser | null {
  const username = input.username.trim();
  const password = input.password;
  if (!username || !password) {
    return null;
  }

  const match = getDemoAccounts().find(
    (account) => account.username === username && account.password === password,
  );

  if (!match) {
    return null;
  }

  return { username: match.username, role: match.role };
}
