import { auth } from '@/auth';
import { formatDate } from '@/lib/utils';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import SNSAssetCard from './SNSAssetCard';

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
                    {assets.map((rawAsset: any) => {
                        // Serialize for Client Component
                        const asset = {
                            ...rawAsset,
                            _id: rawAsset._id.toString(),
                            createdAt: formatDate(rawAsset.createdAt),
                            authorId: rawAsset.authorId ? {
                                name: rawAsset.authorId.name,
                                empId: rawAsset.authorId.empId
                            } : { name: 'Unknown', empId: '' }
                        };

                        return (
                            <SNSAssetCard key={asset._id} asset={asset} />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
