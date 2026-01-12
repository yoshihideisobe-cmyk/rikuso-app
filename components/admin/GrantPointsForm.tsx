'use client';

import { grantPoints } from '@/app/actions';
import { useState } from 'react';
import { Loader2, Coins, UserCheck } from 'lucide-react';

export default function GrantPointsForm() {
    // For MVP, simple ID input. Ideal: User Search/Select
    const [empId, setEmpId] = useState('');
    const [amount, setAmount] = useState('100');
    const [reason, setReason] = useState('安全運転報奨');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);

    // Note: To make this robust, we need to lookup User ID by EmpID. 
    // Since grantPoints takes userId (ObjectId), but admin knows EmpID.
    // I will add a helper in actions or just pass EmpID to grantPoints and let it resolve.
    // Let's modify grantPoints to take EmpID for convenience.

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus({ type: 'loading', message: '付与中...' });

        const result = await grantPoints(empId, parseInt(amount), reason);
        if (result.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: `${empId} さんに ${amount}pt 付与しました` });
            setEmpId('');
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-600" />
                ポイント付与 (Admin)
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">社員番号</label>
                        <input
                            type="text"
                            value={empId}
                            onChange={e => setEmpId(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="例: D001"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">ポイント数</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">事由</label>
                    <input
                        type="text"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="例: 無事故・無違反"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={status?.type === 'loading'}
                    className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex justify-center items-center"
                >
                    {status?.type === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "ポイント付与"}
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
