'use client';

import { createTrafficPost } from '@/app/actions';
import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Send, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormStatus } from 'react-dom';
import imageCompression from 'browser-image-compression';
import { useToast } from '@/components/ui/ToastProvider';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                "flex items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                pending && "cursor-not-allowed opacity-70"
            )}
        >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>{pending ? '投稿中...' : '速報を投稿'}</span>
        </button>
    );
}

export default function TrafficForm() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    async function clientAction(formData: FormData) {
        setStatus(null);

        // Check file size (Client side before compression)
        const file = formData.get('image') as File;
        if (file && file.size > 20 * 1024 * 1024) {
            toast('画像サイズが大きすぎます (20MB以下)', 'error');
            return;
        }

        let uploadData = formData;
        // Compression
        if (file && file.size > 0 && file.type.startsWith('image/')) {
            try {
                const options = {
                    maxSizeMB: 3.5,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);

                const newFormData = new FormData();
                formData.forEach((value, key) => {
                    if (key !== 'image') newFormData.append(key, value);
                });
                newFormData.append('image', compressedFile, file.name);
                uploadData = newFormData;
            } catch (error) {
                console.error('Compression failed:', error);
                // Continue with original? Or stop? Let's try original but warn in console.
            }
        }

        const result = await createTrafficPost(uploadData);

        if (result?.error) {
            setStatus({ type: 'error', message: result.error });
            toast(result.error, 'error');
        } else {
            setStatus({ type: 'success', message: '速報を投稿しました' });
            toast('投稿しました', 'success');
            formRef.current?.reset();
            setFileName(null);
            // Clear success message after 3 seconds
            setTimeout(() => setStatus(null), 3000);
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

                {/* Image Input Area */}
                <div className="flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors">
                        <div className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium">{fileName || '画像を追加'}</span>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                    {fileName && (
                        <button
                            type="button"
                            onClick={() => {
                                setFileName(null);
                                if (formRef.current) formRef.current.reset(); // This might convert to controlled if complex, but reset works for now
                                // NOTE: reset() clears everything. If we want to clear only file, we need controlled input or more complex logic.
                                // Simple fix: Re-find the file input and clear it.
                                const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                            }}
                            className="ml-2 text-xs text-red-500 hover:underline"
                        >
                            削除
                        </button>
                    )}
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
