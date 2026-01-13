'use client';

import { uploadSNSAsset } from '@/app/actions';
import { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Send, Instagram, Mic } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useToast } from '@/components/ui/ToastProvider';
import imageCompression from 'browser-image-compression';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center transition-colors"
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    送信中...
                </>
            ) : (
                <>
                    <Send className="w-4 h-4 mr-2" />
                    送信する
                </>
            )}
        </button>
    );
}

export default function SNSUploadForm() {
    const { toast } = useToast();
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [comment, setComment] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    // Voice Input Hook
    const { isListening, isSupported, startListening, error: voiceError } = useVoiceInput((text) => {
        setComment(prev => prev + (prev ? ' ' : '') + text);
    });

    // Handle voice error display
    if (voiceError && status?.type !== 'error') {
        setStatus({ type: 'error', message: voiceError });
    }

    async function handleSubmit(formData: FormData) {
        setStatus(null); // Clear previous status

        // Manual file size check (Client-side) - Initial check before compression
        const file = formData.get('image') as File;
        if (file && file.size > 20 * 1024 * 1024) { // 20MB limit for raw file (higher than before since we compress)
            setStatus({ type: 'error', message: '元の画像サイズが大きすぎます（20MB以下にしてください）' });
            toast('画像サイズが大きすぎます', 'error');
            return;
        }

        // Compression
        let uploadData = formData;
        if (file && file.size > 0 && file.type.startsWith('image/')) {
            try {
                const options = {
                    maxSizeMB: 3.5, // 4.5MB limit on Vercel
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);

                // Create new FormData with compressed file
                const newFormData = new FormData();
                // Copy other fields
                formData.forEach((value, key) => {
                    if (key !== 'image') newFormData.append(key, value);
                });
                newFormData.append('image', compressedFile, file.name);
                uploadData = newFormData;
            } catch (error) {
                console.error('Compression ended with error:', error);
                // Continue with original file if compression fails, or return error?
                // Depending on severity, we might try to upload original but risk 413.
                // Let's log and try original.
            }
        }

        const result = await uploadSNSAsset(uploadData);

        if (result?.error) {
            setStatus({ type: 'error', message: result.error });
            toast(result.error, 'error');
        } else {
            setStatus({ type: 'success', message: '送信しました。事務所が確認します。' });
            toast('送信しました', 'success');
            setComment('');
            // Reset form (clears file input)
            formRef.current?.reset();
        }
    }

    // File size check onChange
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert('画像サイズが大きすぎます（10MB以下にしてください）');
                e.target.value = ''; // Clear input
            }
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-pink-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Instagram className="w-5 h-5 mr-2 text-pink-600" />
                SNS素材提供
            </h3>
            <p className="text-xs text-gray-500 mb-4">
                「映える」風景やご飯やお店の写真を送ってください。<br />
                事務所で加工してInstagram等にアップします。
            </p>

            <form ref={formRef} action={handleSubmit} className="space-y-4">
                <div className="relative">
                    <textarea
                        name="comment"
                        className="w-full text-sm p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-pink-500"
                        rows={2}
                        placeholder="コメント（説明や、交通アクセスなどの情報説明をお願いします）"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
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

                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-pink-50 file:text-pink-700
                        hover:file:bg-pink-100"
                />

                <SubmitButton />
            </form>

            <span className="hidden text-green-600 text-red-600" /> {/* Prevent purge of dynamic classes just in case */}
        </div>
    );
}
