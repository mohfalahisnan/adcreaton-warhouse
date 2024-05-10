import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { loginUser } from "@/lib/actions/accounts";

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "username", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const user = await loginUser({
          username: credentials.username as string,
          password: credentials.password as string,
        });

        if (!user) {
          return null;
        } else {
          if (user.status === "success") {
            return {
              id: user.data?.user_id,
              email: user.data?.email,
              name: user.data?.name,
            };
          }
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
});
