'use client';

import { getPendingReports, publishNotice } from '@/app/actions';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/ToastProvider'; // Keep existing import path

// Define types based on return from getPendingReports
type PendingReport = {
    _id: string;
    type: string;
    content: string;
    authorId: {
        _id: string;
        name: string;
        empId: string;
    };
    createdAt: string;
    images: string[];
};

export default function AdminInbox() {
    const { toast } = useToast();
    const [reports, setReports] = useState<PendingReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');

    async function fetchReports() {
        setLoading(true);
        const data = await getPendingReports();
        setReports(data as any); // Cast for simplicity now
        setLoading(false);
    }

    useEffect(() => {
        fetchReports();
    }, []);

    const handlePublishClick = (report: PendingReport) => {
        setEditingId(report._id);
        const typeLabel = report.type === 'near_miss' ? 'ヒヤリハット' : '納車先注意';
        setNoticeTitle(`【${typeLabel}】周知`);
        setNoticeContent(`(匿名化済み)\n\n${report.content}\n\n注意してください。`);
    };

    const handlePublishSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        const result = await publishNotice(editingId, noticeTitle, noticeContent, 'All');
        if (result.success) {
            toast('周知を配信しました', 'success');
            setEditingId(null);
            fetchReports(); // Refresh
        } else {
            toast('配信に失敗しました', 'error');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
    }

    if (reports.length === 0) {
        return <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">未処理の報告はありません</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">受信箱 (未処理: {reports.length})</h3>
                <button onClick={fetchReports} className="text-sm text-blue-600 flex items-center"><RefreshCw className="w-3 h-3 mr-1" /> 更新</button>
            </div>

            {reports.map((report) => (
                <div key={report._id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    {editingId === report._id ? (
                        <form onSubmit={handlePublishSubmit} className="space-y-3 bg-blue-50 p-3 rounded">
                            <h4 className="font-bold text-sm text-blue-800">周知として配信</h4>
                            <input
                                className="w-full border p-2 rounded text-sm"
                                value={noticeTitle}
                                onChange={e => setNoticeTitle(e.target.value)}
                                placeholder="タイトル"
                                required
                            />
                            <textarea
                                className="w-full border p-2 rounded text-sm"
                                rows={4}
                                value={noticeContent}
                                onChange={e => setNoticeContent(e.target.value)}
                                placeholder="内容 (匿名化して編集)"
                                required
                            />
                            <div className="flex space-x-2 justify-end">
                                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-gray-600 bg-white border rounded">キャンセル</button>
                                <button type="submit" className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">配信する</button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded textxs font-medium text-white text-[10px]",
                                    report.type === 'near_miss' ? "bg-red-500" : "bg-orange-500"
                                )}>
                                    {report.type === 'near_miss' ? 'ヒヤリ' : '納車先'}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">{report.content}</p>

                            {report.images.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-xs text-blue-600 underline">画像あり (Cloudinary URL)</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t pt-2 mt-2">
                                <div className="text-xs text-gray-500">
                                    投稿者: <span className="font-medium">{report.authorId.name}</span>
                                </div>
                                <button
                                    onClick={() => handlePublishClick(report)}
                                    className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
                                >
                                    確認・周知作成
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
