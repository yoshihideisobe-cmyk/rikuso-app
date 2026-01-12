'use client';

import { Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { deletePost } from '@/app/actions';
import { useToast } from '@/components/ui/ToastProvider';

export default function DeletePostButton({ postId }: { postId: string }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm('本当にこの投稿を削除しますか？\n削除すると元に戻せません。')) {
            return;
        }

        setLoading(true);
        const result = await deletePost(postId);

        if (result?.error) {
            toast(result.error, 'error');
            setLoading(false);
        } else {
            toast('削除しました', 'success');
            // Optimistic update or refresh handled by Server Action revalidatePath
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
            title="削除"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
    );
}
