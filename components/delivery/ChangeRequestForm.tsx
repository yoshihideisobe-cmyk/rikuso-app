'use client';

import { createChangeRequest } from '@/app/actions';
import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';

export default function ChangeRequestForm({ siteId }: { siteId: string }) {
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!content.trim()) return;

        setStatus({ type: 'loading', message: '送信中...' });

        const result = await createChangeRequest(siteId, content);
        if (result.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: '修正依頼を送信しました。' });
            setContent('');
        }
    }

    return (
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-bold text-orange-900 mb-2 text-sm">情報の修正依頼</h4>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full text-sm p-2 rounded border border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    rows={3}
                    placeholder="例: 受付は2Fに変更されています。/ 担当者が変更になりました。"
                    required
                />
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={status?.type === 'loading'}
                        className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-700 flex items-center"
                    >
                        {status?.type === 'loading' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                        依頼送信
                    </button>
                </div>
                {status && status.type !== 'loading' && (
                    <p className={`mt-2 text-xs ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {status.message}
                    </p>
                )}
            </form>
        </div>
    );
}
