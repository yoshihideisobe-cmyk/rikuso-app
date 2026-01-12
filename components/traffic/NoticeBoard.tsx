import { getNotices } from '@/app/actions';
import { Bell } from 'lucide-react';

export default async function NoticeBoard() {
    const notices = await getNotices();

    if (notices.length === 0) return null;

    return (
        <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <Bell className="w-4 h-4 mr-1" />
                事務所からの周知
            </h2>
            <div className="space-y-3">
                {notices.map((notice) => (
                    <div key={notice._id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-800 text-sm">{notice.title}</h3>
                            <span className="text-xs text-gray-400">{new Date(notice.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
