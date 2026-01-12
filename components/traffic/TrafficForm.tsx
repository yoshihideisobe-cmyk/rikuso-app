'use client';

import { createTrafficPost } from '@/app/actions';
import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                "flex items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                pending && "cursor-not-allowed opacity-70"
            )}
        >
            <Send className="h-4 w-4" />
            <span>{pending ? '投稿中...' : '速報を投稿'}</span>
        </button>
    );
}

export default function TrafficForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    async function clientAction(formData: FormData) {
        setStatus(null);
        const result = await createTrafficPost(formData);

        if (result?.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: '速報を投稿しました' });
            formRef.current?.reset();
            // Clear success message after 3 seconds
            setTimeout(() => setStatus(null), 3000);
        }
    }

    return (
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">速報を共有</h3>
            <form ref={formRef} action={clientAction} className="space-y-4">
                <div>
                    <textarea
                        name="content"
                        required
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="いまどうなってる？ (例: 国道1号線〇〇交差点で事故処理中、交互通行)"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">有効期限:</span>
                        <select
                            name="duration"
                            className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
                            defaultValue="6"
                        >
                            <option value="1">1時間</option>
                            <option value="3">3時間</option>
                            <option value="6">6時間</option>
                            <option value="12">12時間</option>
                            <option value="24">24時間</option>
                        </select>
                    </div>

                    <SubmitButton />
                </div>
            </form>

            {status && (
                <div className={cn(
                    "mt-3 flex items-center rounded-lg p-3 text-sm",
                    status.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                )}>
                    {status.type === 'success' ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                    {status.message}
                </div>
            )}
        </div>
    );
}
