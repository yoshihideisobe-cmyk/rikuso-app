import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            empId: string;
        } & DefaultSession["user"]
    }

    interface User {
        role: string;
        empId: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        empId: string;
        id: string;
    }
}
