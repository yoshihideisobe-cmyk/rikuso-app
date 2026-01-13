import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { Download } from 'lucide-react';
import DeleteSNSAssetButton from './DeleteSNSAssetButton';

export default async function SNSAssetManager() {
    const session = await auth();
    if (!session || !['office_admin', 'safety_admin'].includes(session.user.role)) return null;

    await dbConnect();
    const assets = await Post.find({ type: 'sns_asset' })
        .sort({ createdAt: -1 })
        .populate('authorId', 'name empId')
        .lean();

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">SNS素材管理</h3>

            {assets.length === 0 ? (
                <p className="text-gray-500 text-sm">現在、素材はありません。</p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {assets.map((asset: any) => (
                        <div key={asset._id} className="border rounded-lg overflow-hidden group relative">
                            {/* Image Display */}
                            {asset.images && asset.images.length > 0 ? (
                                <img src={asset.images[0]} alt="SNS Asset" className="w-full h-32 object-cover" />
                            ) : (
                                <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                            )}

                            <div className="p-2">
                                <p className="text-xs text-gray-800 font-bold truncate">{asset.content}</p>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Provided by: {asset.authorId?.name} ({new Date(asset.createdAt).toLocaleDateString()})
                                </p>
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-0 left-0 w-full p-2 flex justify-between bg-gradient-to-b from-black/50 to-transparent">
                                <DeleteSNSAssetButton postId={asset._id.toString()} />

                                {asset.images && asset.images.length > 0 && (
                                    <a
                                        href={asset.images[0]}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white/90 p-1.5 rounded-full text-gray-700 hover:text-blue-600 hover:bg-white transition-colors shadow-sm"
                                        title="ダウンロード"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
