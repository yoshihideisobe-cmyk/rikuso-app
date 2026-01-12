'use client';

// NextAuth v5 recommends server actions for credentials, but client signIn is also fine.
// Let's use standard client-side state for visual feedback on MVP.

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const empId = formData.get('empId') as string;
        const pin = formData.get('pin') as string;

        try {
            const result = await signIn('credentials', {
                empId,
                pin,
                redirect: false,
            });

            if (result?.error) {
                setError('Login failed. Please check your ID and PIN.');
                setLoading(false);
            } else {
                router.push('/'); // Redirect to home
                router.refresh(); // Refresh to update session
            }
        } catch (err) {
            setError('An expected error occurred.');
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    Rikuso App
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="empId" className="block text-sm font-medium text-gray-700">
                            Employee ID
                        </label>
                        <input
                            id="empId"
                            name="empId"
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. D001"
                        />
                    </div>
                    <div>
                        <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                            PIN Code
                        </label>
                        <input
                            id="pin"
                            name="pin"
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="****"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
