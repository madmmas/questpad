export const ROLES = ["parent", "child"] as const;
export type Role = (typeof ROLES)[number];

export type SessionUser = {
  username: string;
  role: Role;
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
