'use client';

import { useState } from 'react';
import { deleteSNSAsset } from '@/app/actions';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export default function DeleteSNSAssetButton({ postId }: { postId: string }) {
    const { toast } = useToast();
    const [isPending, setIsPending] = useState(false);

    const handleDelete = async () => {
        if (!confirm('この素材を削除してもよろしいですか？')) return;

        setIsPending(true);
        const res = await deleteSNSAsset(postId);

        if (res.success) {
            toast('削除しました', 'success');
        } else {
            toast('削除に失敗しました', 'error');
        }
        setIsPending(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="bg-white/80 p-1.5 rounded-full text-red-600 hover:text-red-700 hover:bg-white transition-colors"
            title="削除"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    );
}
