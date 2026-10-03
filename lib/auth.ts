import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "sdn302-asm2-orbit-jwt-secret-key-production-ready-2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

// Sign JWT token
export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Password verification
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Extract current authenticated user from Request (cookie or Bearer header)
export async function getAuthUser(request?: NextRequest): Promise<JWTPayload | null> {
  let token: string | undefined;

  if (request) {
    // 1. Try Cookie
    token = request.cookies.get("token")?.value;

    // 2. Try Authorization Header
    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }
  }

  // 3. Fallback to next/headers cookies() for server components / route handlers
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch {
      // Ignored if outside request context
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}
