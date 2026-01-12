'use client';

import { useState, useRef } from 'react';
import { createPost } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { Loader2, Camera, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreatePostPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await createPost(formData);

        if (result?.error) {
            toast(result.error, 'error');
            setLoading(false);
        } else {
            toast('投稿しました', 'success');
            router.push('/'); // Redirect to Home
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        } else {
            setFileName(null);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4 pb-20">
            <header className="flex items-center mb-6">
                <Link href="/" className="mr-4 p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800">新規投稿</h1>
            </header>

            <form action={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">

                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                    <select
                        name="type"
                        className="w-full rounded-lg border-gray-300 border p-3 bg-white"
                        defaultValue="traffic"
                    >
                        <option value="traffic">交通情報共有 (Traffic News)</option>
                        <option value="near_miss">ヒヤリハット共有 (Safety Report)</option>
                        <option value="delivery_note">その他事務所に報告</option>
                    </select>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">タイトル <span className="text-gray-400 text-xs">(任意)</span></label>
                    <input
                        type="text"
                        name="title"
                        className="w-full rounded-lg border border-gray-300 p-3"
                        placeholder="例: 台風接近中、〇〇倉庫の入り口変更"
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">本文 <span className="text-red-500">*</span></label>
                    <textarea
                        name="content"
                        required
                        rows={5}
                        className="w-full rounded-lg border border-gray-300 p-3"
                        placeholder="詳細を入力してください..."
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">画像添付</label>
                    <div className="flex items-center space-x-3">
                        <label className="cursor-pointer flex items-center justify-center space-x-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 w-full hover:bg-gray-50 transition-colors">
                            <Camera className="h-5 w-5 text-gray-500" />
                            <span className="text-gray-600 text-sm">{fileName || "写真を撮る / 選択する"}</span>
                            <input
                                name="image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                        {fileName && (
                            <button type="button" onClick={() => setFileName(null)} className="text-xs text-red-500 hover:underline whitespace-nowrap">
                                削除
                            </button>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    <span>投稿する</span>
                </button>

            </form>
        </main>
    );
}
