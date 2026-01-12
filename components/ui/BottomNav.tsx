'use client';

import Link from 'next/link';
import { Home, Search, Edit, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around text-gray-400 z-50">
            <Link href="/" className={cn("flex flex-col items-center p-2", pathname === '/' ? "text-blue-600" : "hover:text-gray-600")}>
                <Home className="h-5 w-5 mb-0.5" />
                <span className="text-[10px]">ホーム</span>
            </Link>

            {/* 
       For "Post" or "My Page", we don't have routes yet in this confirmed plan, 
       but I'll add links assuming standard structure or keep them as anchors for now.
       */}
            <Link href="/create" className={cn("flex flex-col items-center p-2", pathname === '/create' ? "text-blue-600" : "hover:text-gray-600")}>
                <Edit className="h-5 w-5 mb-0.5" />
                <span className="text-[10px]">投稿</span>
            </Link>

            <Link href="/search" className={cn("flex flex-col items-center p-2", pathname.startsWith('/search') ? "text-blue-600" : "hover:text-gray-600")}>
                <Search className="h-5 w-5 mb-0.5" />
                <span className="text-[10px]">検索</span>
            </Link>

            <Link href="/my" className={cn("flex flex-col items-center p-2", pathname === '/my' ? "text-blue-600" : "hover:text-gray-600")}>
                <User className="h-5 w-5 mb-0.5" />
                <span className="text-[10px]">マイ</span>
            </Link>
        </div>
    );
}
