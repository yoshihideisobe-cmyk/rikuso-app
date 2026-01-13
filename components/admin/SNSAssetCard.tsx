'use client';

import { useState, useTransition } from 'react';
import { deleteSNSAsset } from '@/app/actions';
import { Trash2, Loader2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useRouter } from 'next/navigation';

interface SNSAssetCardProps {
    asset: {
        _id: string;
        content: string;
        images: string[];
        createdAt: string;
        authorId: {
            name: string;
            empId: string;
        };
    };
}

export default function SNSAssetCard({ asset }: SNSAssetCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [isPending, startTransition] = useTransition(); // Actions/Refresh transition
    const [isLocalDeleting, setIsLocalDeleting] = useState(false); // Immediate local loading state

    const handleDelete = async () => {
        if (!confirm('この素材を削除してもよろしいですか？')) return;

        // Optimistic UI update: Hide immediately
        setIsVisible(false);
        setIsLocalDeleting(true);

        try {
            const res = await deleteSNSAsset(asset._id);

            if (res.success) {
                toast('削除しました', 'success');
                startTransition(() => {
                    router.refresh();
                });
            } else {
                // Revert on failure
                setIsVisible(true);
                setIsLocalDeleting(false);
                toast('削除に失敗しました', 'error');
            }
        } catch (e) {
            setIsVisible(true);
            setIsLocalDeleting(false);
            toast('エラーが発生しました', 'error');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="border rounded-lg overflow-hidden group relative transition-all duration-300">
            {/* Image Display */}
            {asset.images && asset.images.length > 0 ? (
                <img src={asset.images[0]} alt="SNS Asset" className="w-full h-32 object-cover" />
            ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
            )}

            <div className="p-2">
                <p className="text-xs text-gray-800 font-bold truncate">{asset.content}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                    Provided by: {asset.authorId?.name} ({asset.createdAt})
                </p>
            </div>

            {/* Actions Overlay */}
            <div className="absolute top-0 left-0 w-full p-2 flex justify-between bg-gradient-to-b from-black/50 to-transparent">
                <button
                    onClick={handleDelete}
                    disabled={isLocalDeleting || isPending}
                    className="bg-white/90 p-1.5 rounded-full text-red-600 hover:text-red-700 hover:bg-white transition-colors shadow-sm disabled:opacity-50"
                    title="削除"
                >
                    {isLocalDeleting || isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>

                {asset.images && asset.images.length > 0 && (
                    <a
                        href={asset.images[0]}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/90 p-1.5 rounded-full text-gray-700 hover:text-blue-600 hover:bg-white transition-colors shadow-sm"
                        title="ダウンロード"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
}
