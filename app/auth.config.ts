import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";
export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Menambahkan role ke dalam token JWT
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || "" },
        });
        token.role = dbUser?.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Menambahkan role ke dalam sesi
      if (token) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
  secret: "asdasedasihdgiyu",
} satisfies NextAuthConfig;
