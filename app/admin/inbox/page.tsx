import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminInbox from '@/components/admin/AdminInbox';
import GrantPointsForm from '@/components/admin/GrantPointsForm';
import SNSAssetManager from '@/components/admin/SNSAssetManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getPendingPosts } from '@/app/actions';
import AdminPendingList from '@/components/admin/AdminPendingList';

export default async function AdminPage() {
    const session = await auth();

    if (!session || !['office_admin', 'safety_admin'].includes(session.user.role)) {
        redirect('/');
    }

    const pendingPosts = await getPendingPosts();

    return (
        <main className="min-h-screen bg-gray-50 p-4 pb-20">
            <header className="mb-6 flex items-center space-x-4 rounded-lg bg-white p-4 shadow-sm">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800">管理者ダッシュボード</h1>
            </header>

            <div className="space-y-8">
                {pendingPosts.length > 0 && (
                    <AdminPendingList initialPosts={pendingPosts} />
                )}

                {/* 
                  Existing AdminInbox might be redundant if we use AdminPendingList for everything,
                  but keeping it for now in case it has other logic. 
                  Based on user request "Change UI placement", moving the new full-featured list here is the key.
                */}
                <div className="opacity-50 pointer-events-none grayscale hidden">
                    {/* Hiding old inbox temporarily to prioritize the new flow if they conflict, or keeping it below. 
                        User said "Dispose Home form and move to Inbox".
                        I will render the new AdminPendingList at the top. 
                     */}
                    <AdminInbox />
                </div>

                <GrantPointsForm />
                <SNSAssetManager />
            </div>
        </main>
    );
}
