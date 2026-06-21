import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const response = await fetch(`${baseURL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Invalid login credentials");
        }

        const user = payload.data?.user;
        if (user?.role !== "admin") {
          throw new Error("Only admin users can access this dashboard");
        }

        return {
          id: user?._id,
          _id: user?._id,
          name: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email,
          email: user?.email,
          image: user?.avatar?.url || null,
          role: user?.role,
          accessToken: payload.data?.accessToken,
          refreshToken: payload.data?.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user._id = token._id;
      session.user.role = token.role;
      return session;
    },
  },
};
