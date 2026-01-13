'use client';

import { createSafetyReport } from '@/app/actions';
import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Camera, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                "flex w-full items-center justify-center space-x-2 rounded-lg bg-orange-600 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                pending && "cursor-not-allowed opacity-70"
            )}
        >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>{pending ? '送信中...' : '報告を送信'}</span>
        </button>
    );
}

export default function SafetyForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    // Restore states that were accidentally removed
    const [reportType, setReportType] = useState('near_miss');
    const [fileName, setFileName] = useState<string | null>(null);

    async function clientAction(formData: FormData) {
        formData.set('type', reportType);

        const file = formData.get('image') as File;
        let uploadData = formData;

        if (file && file.size > 0 && file.type.startsWith('image/')) {
            try {
                const options = {
                    maxSizeMB: 3.5,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);

                // Need to reconstruct FormData to replace 'image'
                // Since we can't easily iterate and replace in place cleanly in all cases,
                // we'll clone.
                const newFormData = new FormData();
                formData.forEach((value, key) => {
                    if (key !== 'image') newFormData.append(key, value);
                });
                newFormData.append('image', compressedFile, file.name);
                uploadData = newFormData;
            } catch (error) {
                console.error('Compression failed:', error);
            }
        }

        const result = await createSafetyReport(uploadData);

        if (result?.error) {
            toast(result.error, 'error');
        } else {
            toast('報告を受け付けました。事務所が確認後、周知されます。', 'success');
            formRef.current?.reset();
            setFileName(null);
            router.refresh(); // Refresh to potentially show new data if listed
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
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-orange-100">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">安全・注意報告</h3>

            <div className="mb-4 flex space-x-2">
                <button
                    type="button"
                    onClick={() => setReportType('near_miss')}
                    className={cn(
                        "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                        reportType === 'near_miss' ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                >
                    ヒヤリハット
                </button>
                <button
                    type="button"
                    onClick={() => setReportType('delivery_note')}
                    className={cn(
                        "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                        reportType === 'delivery_note' ? "bg-orange-100 text-orange-700 ring-1 ring-orange-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                >
                    納車先注意
                </button>
            </div>

            <form ref={formRef} action={clientAction} className="space-y-4">
                <div>
                    <textarea
                        name="content"
                        required
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder={reportType === 'near_miss' ? "例: 第一京浜の交差点で無理な割り込みあり..." : "例: 〇〇倉庫の搬入口、段差が高く擦りそう..."}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <label htmlFor="image-upload" className="cursor-pointer flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                        <Camera className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{fileName || "写真を追加"}</span>
                        <input
                            id="image-upload"
                            name="image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                    {fileName && (
                        <button type="button" onClick={() => {
                            setFileName(null);
                            // Reset file input if needed, complex in React controlled/uncontrolled mix
                        }} className="text-xs text-red-500 hover:underline">削除</button>
                    )}
                </div>

                <SubmitButton />
            </form>
        </div>
    );
}
