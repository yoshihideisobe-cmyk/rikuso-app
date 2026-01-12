import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod'; // We installed zod
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                empId: { label: "Employee ID", type: "text" },
                pin: { label: "PIN", type: "password" },
            },
            authorize: async (credentials) => {
                console.log("=== Login Debug Start ===");
                console.log("Input Credentials:", credentials);

                const parsedCredentials = z
                    .object({ empId: z.string(), pin: z.string() })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { empId, pin } = parsedCredentials.data;
                    console.log('Querying DB for empId:', empId);

                    await dbConnect();
                    // Explicitly select pin just in case, though it shouldn't be hidden by default unless changed
                    const user = await User.findOne({ empId }).select('+pin');

                    console.log("DB User Found:", user ? "YES" : "NO");
                    if (user) {
                        console.log("DB User ID:", user._id);
                        console.log("DB User Role:", user.role);
                        // console.log("DB Stored PIN:", user.pin); // Log specific pin only if necessary, safety first but user asked for it
                    }

                    if (!user || !user.pin) {
                        console.log("=== Login Failed: User not found or PIN missing ===");
                        return null;
                    }

                    // Hybrid Password Check
                    // 1. Try plain text comparison first
                    let passwordsMatch = pin === user.pin;
                    console.log(`Plain text check for '${pin}':`, passwordsMatch);

                    // 2. If not match, try bcrypt
                    if (!passwordsMatch) {
                        console.log("Plain text failed, trying bcrypt...");
                        passwordsMatch = await bcrypt.compare(pin, user.pin);
                        console.log("Bcrypt check:", passwordsMatch);
                    }

                    if (passwordsMatch) {
                        console.log("=== Login Success ===");
                        return {
                            id: user._id.toString(),
                            name: user.name,
                            role: user.role,
                            empId: user.empId,
                        };
                    } else {
                        console.log("=== Login Failed: Password mismatch ===");
                    }
                } else {
                    console.log("=== Login Failed: Invalid credentials format ===");
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.empId = user.empId;
                token.id = user.id as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = (token.role as string) || 'driver';
                session.user.empId = (token.empId as string) || '';
                session.user.id = (token.id as string) || '';
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
});
