import CredentialsProvider from "next-auth/providers/credentials";

import type { NextAuthConfig } from "next-auth";

export default {
  providers: [CredentialsProvider],
} satisfies NextAuthConfig;
