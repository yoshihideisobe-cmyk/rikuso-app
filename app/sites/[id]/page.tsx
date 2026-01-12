import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import DeliverySite from '@/models/DeliverySite';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import ChangeRequestForm from '@/components/delivery/ChangeRequestForm';

// Dynamic route page
export default async function SiteDetailPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session) redirect('/login');

    await dbConnect();
    const site = await DeliverySite.findById(params.id).lean();

    if (!site) {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center justify-center">
                <p>指定された納車先が見つかりません</p>
                <Link href="/" className="mt-4 text-blue-600 underline">ホームへ戻る</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <Link href="/" className="inline-flex items-center text-gray-500 mb-4 hover:text-gray-800">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    戻る
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-blue-600 p-4 text-white">
                        <div className="text-xs opacity-80">納車先詳細</div>
                        <h1 className="text-xl font-bold mt-1">{site.name}</h1>
                    </div>

                    <div className="p-4 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 block uppercase">住所</label>
                            <div className="flex items-start mt-1">
                                <MapPin className="w-4 h-4 text-gray-400 mr-1 mt-1 flex-shrink-0" />
                                <p className="text-gray-800">{site.address}</p>
                            </div>
                        </div>

                        {site.notes && (
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <label className="text-xs font-bold text-yellow-700 block uppercase mb-1">注意事項</label>
                                <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">{site.notes}</p>
                            </div>
                        )}

                        {/* Metadata display if any */}
                        {site.metadata && Object.keys(site.metadata).length > 0 && (
                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">その他情報</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {Object.entries(site.metadata).map(([key, value]: [string, any]) => {
                                        if (['name', 'address', 'notes', 'siteCode'].includes(key)) return null;
                                        if (typeof value !== 'string' && typeof value !== 'number') return null;
                                        return (
                                            <div key={key} className="bg-gray-50 p-2 rounded">
                                                <div className="text-gray-400 mb-0.5">{key}</div>
                                                <div className="font-medium truncate">{value}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <ChangeRequestForm siteId={site._id.toString()} />

            </div>
        </main>
    );
}
