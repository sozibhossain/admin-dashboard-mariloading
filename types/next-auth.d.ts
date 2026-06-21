import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      _id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    _id?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}
