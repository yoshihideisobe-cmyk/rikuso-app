'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Post, { IPost } from '@/models/Post';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File | null;

    if (!content) {
        return { error: 'Content is required' };
    }

    await dbConnect();

    // Image Handling
    let imageUrl = '';
    if (imageFile && imageFile.size > 0) {
        try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
        } catch (e) {
            console.error('Image processing failed:', e);
            return { error: '画像の処理に失敗しました' };
        }
    }

    // Determine Status & Expiration
    let status = 'pending';
    let expiresAt: Date | undefined;

    if (type === 'traffic') {
        status = 'approved'; // Traffic news is auto-approved
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Default 24h
    } else {
        // 'near_miss' (Safety) and 'delivery_note' (Others) are pending
        status = 'pending';
    }

    try {
        await Post.create({
            authorId: session.user.id,
            type,
            title,
            content,
            status,
            expiresAt,
            images: imageUrl ? [imageUrl] : []
        });
    } catch (error) {
        console.error('Failed to create post:', error);
        return { error: 'Failed to create post' };
    }

    revalidatePath('/');
    return { success: true, status };
}

export async function getPendingPosts() {
    const session = await auth();
    if (!session || !['office_admin', 'safety_admin'].includes(session.user.role)) {
        return [];
    }

    await dbConnect();

    const posts = await Post.find({ status: 'pending' })
        .sort({ createdAt: 1 }) // Oldest first
        .populate('authorId', 'name role')
        .lean();

    type PopulatedPost = {
        _id: mongoose.Types.ObjectId;
        authorId: { _id: mongoose.Types.ObjectId; name: string; role: string };
        type: string;
        title?: string;
        content: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        images: string[];
    };

    return (posts as unknown as PopulatedPost[]).map(post => ({
        ...post,
        _id: post._id.toString(),
        authorId: post.authorId ? {
            ...post.authorId,
            _id: post.authorId._id.toString(),
        } : {
            _id: 'unknown',
            name: '不明なユーザー',
            role: 'unknown'
        },
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        images: post.images || []
    }));
}

// Unified review action with points
export async function reviewPost(
    postId: string,
    action: 'confirm' | 'share',
    points: number,
    reason: string
) {
    const session = await auth();
    if (!session || !['office_admin', 'safety_admin'].includes(session.user.role)) {
        return { error: 'Unauthorized' };
    }

    await dbConnect();

    // 1. Grant Points if applicable
    if (points > 0) {
        const post = await Post.findById(postId);
        if (post) {
            // Note: We need empId for grantPoints but here we have userId (post.authorId).
            // We can create PointsLedger directly here using userId.
            // Using logic similar to grantPoints but with userId directly.

            try {
                await PointsLedger.create({
                    userId: post.authorId,
                    amount: points,
                    reason: reason || '報告ポイント',
                    relatedId: postId
                });
            } catch (e) {
                console.error('Points Grant Failed:', e);
                return { error: 'ポイント付与に失敗しました' };
            }
        }
    }

    // 2. Update Status and Expiration
    const newStatus = action === 'share' ? 'approved' : 'confirmed';
    const updateData: any = { status: newStatus };

    if (newStatus === 'approved') {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 72); // 72 hours from approval
        updateData.expiresAt = expiresAt;
    }

    try {
        await Post.findByIdAndUpdate(postId, updateData);
    } catch (e) {
        console.error('Status Update Failed:', e);
        return { error: 'ステータス更新に失敗しました' };
    }

    revalidatePath('/');
    return { success: true };
}

export async function createTrafficPost(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const content = formData.get('content') as string;
    const duration = formData.get('duration') as string; // in hours

    if (!content) {
        return { error: 'Content is required' };
    }

    await dbConnect();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + parseInt(duration || '24'));

    try {
        await Post.create({
            authorId: session.user.id,
            type: 'traffic',
            content,
            status: 'approved', // Traffic news is auto-approved
            expiresAt,
        });
    } catch (error) {
        console.error('Failed to create post:', error);
        return { error: 'Failed to create post' };
    }

    revalidatePath('/');
    return { success: true };
}

export async function getTimelinePosts() {
    const session = await auth();
    if (!session) return [];

    await dbConnect();

    // Fetch all types of posts for the timeline
    // Prioritize recent posts
    const posts = await Post.find({
        status: 'approved', // Only approved posts (createPost sets this to approved)
        expiresAt: { $gt: new Date() }, // Check expiration if consistent with logic, or remove if not all have expiration
    })
        .sort({ createdAt: -1 })
        .populate('authorId', 'name role')
        .lean();

    type PopulatedPost = {
        _id: mongoose.Types.ObjectId;
        authorId: { _id: mongoose.Types.ObjectId; name: string; role: string };
        type: string;
        title?: string;
        content: string;
        status: string;
        expiresAt?: Date;
        createdAt: Date;
        updatedAt: Date;
        images: string[];
    };

    return (posts as unknown as PopulatedPost[]).map(post => ({
        ...post,
        _id: post._id.toString(),
        authorId: post.authorId ? {
            ...post.authorId,
            _id: post.authorId._id.toString(),
        } : {
            _id: 'unknown',
            name: '不明なユーザー',
            role: 'unknown'
        },
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        expiresAt: post.expiresAt?.toISOString(),
        images: post.images || []
    }));
}

// --- Safety & Reporting Actions ---

import Notice from '@/models/Notice';

export async function createSafetyReport(formData: FormData) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };

    const type = formData.get('type') as 'near_miss' | 'delivery_note';
    const content = formData.get('content') as string;
    const imageFile = formData.get('image') as File | null;

    if (!content) return { error: '内容を入力してください' };

    await dbConnect();

    let imageUrl = '';
    if (imageFile && imageFile.size > 0) {
        try {
            // MVP: Convert to Base64
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
        } catch (e) {
            console.error('Image processing failed:', e);
            return { error: '画像の処理に失敗しました' };
        }
    }

    try {
        await Post.create({
            authorId: session.user.id,
            type,
            content,
            status: 'pending', // Requires admin review
            images: imageUrl ? [imageUrl] : [],
        });
    } catch (e) {
        console.error(e);
        return { error: '報告の保存に失敗しました' };
    }

    revalidatePath('/'); // My page history might update
    return { success: true };
}

export async function getPendingReports() {
    const session = await auth();
    if (!session || !['office_admin', 'safety_admin'].includes(session.user.role)) {
        return [];
    }

    await dbConnect();

    const posts = await Post.find({
        status: 'pending',
        type: { $in: ['near_miss', 'delivery_note'] },
    })
        .sort({ createdAt: 1 }) // Oldest first
        .populate('authorId', 'name empId')
        .lean();

    return posts.map(post => ({
        ...post,
        _id: post._id.toString(),
        authorId: {
            ...post.authorId,
            _id: post.authorId._id.toString(),
        },
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        images: post.images || [],
    }));
}

export async function publishNotice(
    originalPostId: string,
    title: string,
    content: string,
    targetAudience: string
) {
    const session = await auth();
    // Only office_admin can publish notices
    if (!session || session.user.role !== 'office_admin') {
        return { error: '権限がありません' };
    }

    await dbConnect();

    try {
        // 1. Create Notice
        await Notice.create({
            creatorId: session.user.id,
            originalPostId,
            title,
            content,
            targetAudience
        });

        // 2. Update original Post status
        await Post.findByIdAndUpdate(originalPostId, { status: 'approved' });

    } catch (e) {
        console.error(e);
        return { error: '周知の作成に失敗しました' };
    }

    revalidatePath('/admin/inbox');
    revalidatePath('/');
    return { success: true };
}

export async function getNotices() {
    await dbConnect();
    const notices = await Notice.find({})
        .sort({ publishedAt: -1 })
        .populate('creatorId', 'name')
        .lean();

    return notices.map(n => ({
        ...n,
        _id: n._id.toString(),
        creatorId: { ...n.creatorId, _id: n.creatorId._id.toString() },
        createdAt: n.createdAt.toISOString(),
        publishedAt: n.publishedAt.toISOString(),
        originalPostId: n.originalPostId?.toString(),
    }));
}

// --- Delivery Sites Actions ---

import DeliverySite from '@/models/DeliverySite';
import ChangeRequest from '@/models/ChangeRequest';
import { parseDeliverySitesExcel } from '@/lib/excel';

export async function importDeliverySites(formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'office_admin') {
        return { error: '権限がありません' };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { error: 'ファイルを選択してください' };
    }

    try {
        const sites = await parseDeliverySitesExcel(file);
        await dbConnect();

        // Minimal Bulk Upsert
        const operations = sites.map((site: any) => ({
            updateOne: {
                filter: { siteCode: site.siteCode },
                update: { $set: site },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await DeliverySite.bulkWrite(operations);
        }

        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true, count: operations.length };

    } catch (e) {
        console.error(e);
        return { error: 'インポートに失敗しました' };
    }
}

export async function searchDeliverySites(query: string) {
    const session = await auth();
    if (!session) return [];

    await dbConnect();

    // Simple regex search (fuzzy)
    const regex = new RegExp(query, 'i'); // Case insensitive
    const sites = await DeliverySite.find({
        $or: [
            { name: regex },
            { address: regex },
            { notes: regex }
        ]
    }).limit(20).lean();

    return sites.map(site => ({
        ...site,
        _id: site._id.toString(),
        createdAt: site.createdAt.toISOString(),
        updatedAt: site.updatedAt.toISOString(),
    }));
}

export async function createChangeRequest(siteId: string, requestedChanges: string) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };

    if (!requestedChanges.trim()) return { error: '修正内容を入力してください' };

    await dbConnect();

    try {
        await ChangeRequest.create({
            userId: session.user.id,
            siteId,
            requestedChanges,
            status: 'open'
        });
    } catch (e) {
        console.error(e);
        return { error: '修正依頼の送信に失敗しました' };
    }

    return { success: true };
}

// --- Points Actions ---

import PointsLedger from '@/models/PointsLedger';
import User from '@/models/User';

// Updated to take empId instead of userId
export async function grantPoints(empId: string, amount: number, reason: string) {
    const session = await auth();
    if (!session || session.user.role !== 'office_admin') {
        return { error: '権限がありません' };
    }

    if (amount <= 0) return { error: 'プラスのポイントを指定してください' };

    await dbConnect();

    // Resolve EmpId
    const targetUser = await User.findOne({ empId });
    if (!targetUser) return { error: '指定された社員番号のユーザーが見つかりません' };

    try {
        await PointsLedger.create({
            userId: targetUser._id,
            amount,
            reason
        });
    } catch (e) {
        console.error(e);
        return { error: 'ポイント付与に失敗しました' };
    }

    revalidatePath('/admin');
    revalidatePath('/my');
    return { success: true };
}

export async function getMyPoints() {
    const session = await auth();
    if (!session) return { total: 0, history: [] };

    await dbConnect();

    const history = await PointsLedger.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();

    const total = history.reduce((sum, item) => sum + item.amount, 0);

    return {
        total,
        history: history.map(item => ({
            ...item,
            _id: item._id.toString(),
            createdAt: item.createdAt.toISOString()
        }))
    };
}

// --- SNS Asset Actions ---

export async function uploadSNSAsset(formData: FormData) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };

    const comment = formData.get('comment') as string;
    const imageFile = formData.get('image') as File | null;

    await dbConnect();

    let imageUrl = '';
    if (imageFile && imageFile.size > 0) {
        try {
            // MVP: Convert to Base64
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            imageUrl = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
        } catch (e) {
            console.error('Image processing failed:', e);
            return { error: '画像の処理に失敗しました' };
        }
    }

    await Post.create({
        authorId: session.user.id,
        type: 'sns_asset',
        content: comment || '(コメントなし)',
        status: 'pending',
        images: imageUrl ? [imageUrl] : []
    });

    return { success: true };
}

export async function deleteSNSAsset(postId: string) {
    const session = await auth();
    if (!session || !['office_admin', 'safety_admin'].includes(session.user.role)) {
        return { error: 'Unauthorized' };
    }

    await dbConnect();

    try {
        await Post.findOneAndDelete({ _id: postId, type: 'sns_asset' });
    } catch (e) {
        console.error('Failed to delete asset:', e);
        return { error: '削除に失敗しました' };
    }

    revalidatePath('/admin/inbox'); // Refresh admin inbox
    return { success: true };
}
