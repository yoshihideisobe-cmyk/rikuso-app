'use client';

import { useState } from 'react';
import { reviewPost } from '@/app/actions';
import { Loader2, Check, Eye, FileText, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

type Post = {
    _id: string;
    type: string;
    title?: string;
    content: string;
    authorId: { name: string; role: string };
    createdAt: string;
};

export default function AdminPendingList({ initialPosts }: { initialPosts: Post[] }) {
    const { toast } = useToast();
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [processing, setProcessing] = useState<string | null>(null);

    // State for form inputs per post
    const [formStates, setFormStates] = useState<Record<string, { points: number; reason: string; customReason: string }>>({});

    if (posts.length === 0) return null;

    const handleInput = (postId: string, field: string, value: any) => {
        setFormStates(prev => ({
            ...prev,
            [postId]: {
                ...(prev[postId] || { points: 0, reason: '良いヒヤリハット共有', customReason: '' }),
                [field]: value
            }
        }));
    };

    const handleReview = async (post: Post, action: 'confirm' | 'share') => {
        setProcessing(post._id);
        const state = formStates[post._id] || { points: 0, reason: '良いヒヤリハット共有', customReason: '' };

        // Determine final reason
        const reason = state.reason === 'その他' ? state.customReason : state.reason;

        const res = await reviewPost(post._id, action, state.points, reason);

        if (res.success) {
            toast(action === 'share' ? '承認して全体共有しました' : '確認しました（非公開）', 'success');
            setPosts(posts.filter(p => p._id !== post._id));
        } else {
            toast('エラーが発生しました', 'error');
        }
        setProcessing(null);
    };

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8">
            <h2 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                承認待ちリスト ({posts.length})
            </h2>
            <div className="space-y-4">
                {posts.map(post => {
                    const form = formStates[post._id] || { points: 0, reason: '良いヒヤリハット共有', customReason: '' };

                    return (
                        <div key={post._id} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                            {/* Header Info */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 mr-2 bg-gray-100 px-2 py-0.5 rounded">
                                        {post.type === 'near_miss' ? 'ヒヤリハット' : '事務所報告'}
                                    </span>
                                    <span className="text-xs text-gray-400">{post.authorId.name}</span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Content */}
                            {post.title && <h3 className="font-bold text-gray-800 text-sm mb-1">{post.title}</h3>}
                            <p className="text-sm text-gray-700 mb-4 whitespace-pre-wrap border-l-2 border-gray-200 pl-2">{post.content}</p>

                            {/* Action Form */}
                            <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                                <div className="flex gap-2">
                                    <div className="w-1/4">
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">ポイント</label>
                                        <input
                                            type="number"
                                            value={form.points}
                                            onChange={(e) => handleInput(post._id, 'points', parseInt(e.target.value) || 0)}
                                            className="w-full text-sm border rounded p-1.5"
                                            min="0"
                                        />
                                    </div>
                                    <div className="w-3/4">
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">事由</label>
                                        <select
                                            value={form.reason}
                                            onChange={(e) => handleInput(post._id, 'reason', e.target.value)}
                                            className="w-full text-sm border rounded p-1.5 bg-white"
                                        >
                                            <option>良いヒヤリハット共有</option>
                                            <option>重要な情報共有</option>
                                            <option>積極的な投稿</option>
                                            <option>その他</option>
                                        </select>
                                    </div>
                                </div>

                                {form.reason === 'その他' && (
                                    <input
                                        type="text"
                                        placeholder="事由を入力..."
                                        value={form.customReason}
                                        onChange={(e) => handleInput(post._id, 'customReason', e.target.value)}
                                        className="w-full text-sm border rounded p-1.5"
                                    />
                                )}

                                <div className="flex justify-end space-x-2 pt-1">
                                    <button
                                        onClick={() => handleReview(post, 'confirm')}
                                        disabled={processing === post._id}
                                        className="px-3 py-2 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 flex items-center font-bold"
                                    >
                                        <Eye className="w-3 h-3 mr-1" /> 確認のみ (非公開)
                                    </button>
                                    <button
                                        onClick={() => handleReview(post, 'share')}
                                        disabled={processing === post._id}
                                        className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center font-bold"
                                    >
                                        {processing === post._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                                        承認して全体共有
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
