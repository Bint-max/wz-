/**
 * 认证工具
 * 使用 jose 签发/校验 JWT，并写入 httpOnly Cookie
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "blog_auth_token";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-secret-change-me",
);

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
};

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
};

/** 签发登录 Token */
export async function signToken(user: AuthUser): Promise<string> {
  const jwt = await new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return jwt;
}

/** 校验 Token 并返回载荷 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/** 服务端读取当前登录用户（未登录返回 null） */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

/** 鉴权失败时抛出异常，供后台 API 使用 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/** 供登录接口验证数据库中的账号密码 */
export async function verifyCredentials(email: string, password: string) {
  const { default: bcrypt } = await import("bcryptjs");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role } as AuthUser;
}

export { COOKIE_NAME };
