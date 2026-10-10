import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  clearLoginFailures,
  isLoginBlocked,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";

const loginSchema = z.object({
  email: z.email().transform((value) => value.trim().toLocaleLowerCase("sl-SI")),
  password: z.string().min(1).max(200),
});

const dummyHash = bcrypt.hashSync("invalid-login-placeholder", 12);

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/prijava" },
  providers: [
    CredentialsProvider({
      name: "Geslo",
      credentials: {
        email: { label: "E-pošta", type: "email" },
        password: { label: "Geslo", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        const ipHeader = request.headers?.["x-forwarded-for"];
        const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader?.split(",")[0] ?? "unknown";
        if (!parsed.success) {
          await bcrypt.compare("invalid", dummyHash);
          return null;
        }
        const { email, password } = parsed.data;
        if (await isLoginBlocked(email, ip)) {
          await bcrypt.compare(password, dummyHash);
          return null;
        }
        const user = await db.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
        if (!valid || !user?.isActive) {
          await recordLoginFailure(email, ip);
          return null;
        }
        await clearLoginFailures(email, ip);
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.sessionVersion = token.sessionVersion;
      session.user.mustChangePassword = token.mustChangePassword;
      return session;
    },
  },
};
