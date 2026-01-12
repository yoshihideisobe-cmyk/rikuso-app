'use client';

import { uploadSNSAsset } from '@/app/actions';
import { useState } from 'react';
import { Loader2, Send, Instagram } from 'lucide-react';

export default function SNSUploadForm() {
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setStatus({ type: 'loading', message: 'アップロード中...' });
        const result = await uploadSNSAsset(formData);

        if (result?.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: '送信しました。事務所が確認します。' });
            // Reset form? Hard with raw form action unless using ref
        }
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-pink-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Instagram className="w-5 h-5 mr-2 text-pink-600" />
                SNS素材提供
            </h3>
            <p className="text-xs text-gray-500 mb-4">
                「映える」風景やトラックの写真を送ってください。<br />
                事務所で加工してInstagram等にアップします。
            </p>

            <form action={handleSubmit} className="space-y-4">
                <textarea
                    name="comment"
                    className="w-full text-sm p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    rows={2}
                    placeholder="ひとこと (場所や状況など)"
                />

                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    required
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-pink-50 file:text-pink-700
                        hover:file:bg-pink-100"
                />

                <button
                    type="submit"
                    disabled={status?.type === 'loading'}
                    className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 flex justify-center items-center"
                >
                    {status?.type === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : "送信する"}
                </button>
            </form>

            {status && status.type !== 'loading' && (
                <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {status.message}
                </p>
            )}
        </div>
    );
}
