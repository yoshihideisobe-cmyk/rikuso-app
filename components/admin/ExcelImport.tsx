'use client';

import { importDeliverySites } from '@/app/actions';
import { useState } from 'react';
import { Loader2, Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function ExcelImport() {
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setStatus({ type: 'loading', message: 'インポート中...' });

        try {
            const result = await importDeliverySites(formData);
            if (result.error) {
                setStatus({ type: 'error', message: result.error });
            } else {
                setStatus({ type: 'success', message: `${result.count}件の納車先データを更新しました` });
                setFileName(null);
            }
        } catch (e) {
            setStatus({ type: 'error', message: '予期せぬエラーが発生しました' });
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
            setStatus(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
                納車先マスタ取り込み (Excel)
            </h3>

            <form action={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="excel-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{fileName || "ファイルを選択"}</span></p>
                            <p className="text-xs text-gray-500">.xlsx, .xls</p>
                        </div>
                        <input id="excel-file" name="file" type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} required />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={status?.type === 'loading' || !fileName}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {status?.type === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "インポート開始"}
                </button>
            </form>

            {status && status.type !== 'loading' && (
                <div className={`mt-4 p-3 rounded text-sm flex items-center ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {status.type === 'success' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                    {status.message}
                </div>
            )}
        </div>
    );
}
