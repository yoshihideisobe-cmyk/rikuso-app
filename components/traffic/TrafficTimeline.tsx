import { Clock, MapPin, User, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';
import { getTimelinePosts } from '@/app/actions';
import { formatDate } from '@/lib/utils';
import { auth } from '@/auth';
import DeletePostButton from './DeletePostButton';



function getTypeLabel(type: string) {
    switch (type) {
        case 'traffic': return '交通情報共有';
        case 'near_miss': return 'ヒヤリハット共有';
        case 'delivery_note': return 'その他事務所に報告';
        default: return 'その他';
    }
}

function getTypeColor(type: string) {
    switch (type) {
        case 'traffic': return 'bg-red-100 text-red-700';
        case 'near_miss': return 'bg-yellow-100 text-yellow-700';
        case 'delivery_note': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

export default async function TrafficTimeline() {
    const session = await auth();
    const isAdmin = session?.user.role === 'office_admin' || session?.user.role === 'safety_admin';
    const posts = await getTimelinePosts();

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-12 text-gray-500">
                <AlertTriangle className="mb-2 h-8 w-8 opacity-50" />
                <p>現在、投稿はありません</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <div key={post._id} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 transition-shadow hover:shadow-md relative group">
                    <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${getTypeColor(post.type)}`}>
                                {getTypeLabel(post.type)}
                            </span>
                            <div className="text-xs text-gray-400 flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatDate(post.createdAt)}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-500 font-medium">
                                {post.authorId.name} ({post.authorId.role === 'driver' ? 'Dr' : 'Admin'})
                            </div>
                            {isAdmin && (
                                <DeletePostButton postId={post._id} />
                            )}
                        </div>
                    </div>

                    {post.title && (
                        <h3 className="font-bold text-gray-800 mb-2">{post.title}</h3>
                    )}

                    <div className="mb-4">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">{post.content}</p>
                    </div>

                    {post.images && post.images.length > 0 && (
                        <div className="mb-2">
                            <img
                                src={post.images[0]}
                                alt="添付画像"
                                loading="lazy"
                                className="w-full h-auto rounded-lg border border-gray-200 object-cover max-h-80 cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
