import type { NextAuthConfig, User } from "next-auth";
import { prisma } from "@/lib/prisma";

// Extend the User type to include 'role'
interface ExtendedUser extends User {
  role?: string;
  warehouseId?: number;
}

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
        token.warehouseId = dbUser?.warehouse_id;
      }
      return token;
    },
    async session({ session, token }) {
      // Menambahkan role ke dalam sesi
      if (token) {
        (session.user as ExtendedUser).role = token.role as string;
        (session.user as ExtendedUser).warehouseId =
          token.warehouseId as number;
      }
      return session;
    },
  },
  providers: [],
  secret: "asdasedasihdgiyu",
} satisfies NextAuthConfig;
