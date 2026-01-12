'use client';

import { useState, useRef } from 'react';
import { createPost } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { Loader2, Camera, Send, ArrowLeft } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import Link from 'next/link';

export default function CreatePostPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [content, setContent] = useState('');

    // Voice Input Hook
    const { isListening, isSupported, startListening, error: voiceError } = useVoiceInput((text) => {
        setContent(prev => prev + (prev ? ' ' : '') + text);
    });

    // Handle voice error display (using toast)
    if (voiceError) {
        // toast(voiceError, 'error'); // Can cause infinite loop if not careful, better to just log or show once
        // For now, let's just log
        console.error(voiceError);
    }

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
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('画像サイズが大きすぎます（10MB以下にしてください）');
                e.target.value = '';
                setFileName(null);
                return;
            }
            setFileName(file.name);
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
                    <div className="relative">
                        <textarea
                            name="content"
                            required
                            rows={5}
                            className="w-full rounded-lg border border-gray-300 p-3"
                            placeholder="詳細を入力してください..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        {isSupported && (
                            <button
                                type="button"
                                onClick={startListening}
                                className={`absolute right-2 bottom-2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                title="音声入力"
                            >
                                <div className={`w-4 h-4 rounded-full ${isListening ? 'bg-red-500' : 'bg-current'}`} style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z\'/%3E%3Cpath d=\'M19 10v2a7 7 0 0 1-14 0v-2\'/%3E%3Cline x1=\'12\' y1=\'19\' x2=\'12\' y2=\'23\'/%3E%3Cline x1=\'8\' y1=\'23\' x2=\'16\' y2=\'23\'/%3E%3C/svg%3E")', maskSize: 'contain', WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z\'/%3E%3Cpath d=\'M19 10v2a7 7 0 0 1-14 0v-2\'/%3E%3Cline x1=\'12\' y1=\'19\' x2=\'12\' y2=\'23\'/%3E%3Cline x1=\'8\' y1=\'23\' x2=\'16\' y2=\'23\'/%3E%3C/svg%3E")', WebkitMaskSize: 'contain', backgroundColor: 'currentColor' }} />
                            </button>
                        )}
                    </div>
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
