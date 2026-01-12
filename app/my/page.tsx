import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getMyPoints } from '@/app/actions';
import { Coins, History, Trophy } from 'lucide-react';
import SNSUploadForm from '@/components/sns/SNSUploadForm';

export default async function MyPage() {
    const session = await auth();
    if (!session) redirect('/login');

    const { total, history } = await getMyPoints();

    return (
        <main className="min-h-screen bg-gray-50 pb-20 p-4">
            <h1 className="text-xl font-bold text-gray-800 mb-6">マイページ</h1>

            {/* Profile Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {session.user.name?.charAt(0)}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">{session.user.name}</h2>
                    <p className="text-sm text-gray-500">{session.user.empId} / {session.user.role}</p>
                </div>
            </div>

            {/* Points Card */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 shadow-md text-white mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium opacity-90 flex items-center">
                        <Trophy className="w-4 h-4 mr-1" /> 獲得ポイント
                    </span>
                    <Coins className="w-6 h-6 opacity-80" />
                </div>
                <div className="text-4xl font-bold tracking-tight">
                    {total.toLocaleString()} <span className="text-lg font-normal">pt</span>
                </div>
            </div>

            {/* SNS Upload Link/Form */}
            <div className="mb-8">
                <SNSUploadForm />
            </div>

            {/* History */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                    <History className="w-4 h-4 mr-1" /> ポイント履歴
                </h3>

                <div className="space-y-3">
                    {history.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-4">履歴はありません</p>
                    ) : (
                        history.map((item: any) => (
                            <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{item.reason}</p>
                                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="font-bold text-green-600">+{item.amount}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
