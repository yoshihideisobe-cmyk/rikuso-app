import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { signOut } from '@/auth';
import TrafficTimeline from '@/components/traffic/TrafficTimeline';
import NoticeBoard from '@/components/traffic/NoticeBoard';
import Link from 'next/link';
import { getPendingPosts } from '@/app/actions';
import { Suspense } from 'react';
import { TimelineSkeleton, CardSkeleton } from '@/components/skeletons';

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const isAdmin = ['office_admin', 'safety_admin'].includes(session.user.role);
  const pendingPosts = isAdmin ? await getPendingPosts() : [];

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Rikuso App</h1>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-800">{session.user.name}</div>
              <div className="text-[10px] text-gray-500">{session.user.role}</div>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <button className="rounded px-3 py-1 text-xs text-red-600 border border-red-200 hover:bg-red-50">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto space-y-8">
        <Suspense fallback={<CardSkeleton />}>
          <NoticeBoard />
        </Suspense>

        {isAdmin && pendingPosts.length > 0 && (
          <Link
            href="/admin/inbox"
            className="block bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-r shadow-sm hover:bg-orange-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">承認待ちの報告が {pendingPosts.length} 件あります</p>
                <p className="text-xs">確認して承認またはポイント付与を行ってください</p>
              </div>
              <span className="text-xl font-bold">&rarr;</span>
            </div>
          </Link>
        )}

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">みんなの投稿 (Timeline)</h2>
          <Suspense fallback={<TimelineSkeleton />}>
            <TrafficTimeline />
          </Suspense>
        </div>

        {['office_admin', 'safety_admin'].includes(session.user.role) && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">管理者メニュー</h3>
            <Link href="/admin/inbox" className="block w-full text-center rounded-lg bg-gray-800 p-3 text-white">
              管理者受信箱 (確認・承認)
            </Link>
          </div>
        )}
      </div>

    </main>
  );
}
