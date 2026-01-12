import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotice extends Document {
    creatorId: mongoose.Types.ObjectId;
    originalPostId?: mongoose.Types.ObjectId;
    title: string;
    content: string;
    targetAudience: 'All' | 'Branch' | 'Route'; // 簡易的な区分
    targetValues?: string[]; // 具体的な拠点名など
    publishedAt: Date;
    isImportant: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NoticeSchema: Schema = new Schema(
    {
        creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        originalPostId: { type: Schema.Types.ObjectId, ref: 'Post' },
        title: { type: String, required: true },
        content: { type: String, required: true },
        targetAudience: {
            type: String,
            enum: ['All', 'Branch', 'Route'],
            default: 'All',
        },
        targetValues: { type: [String], default: [] },
        publishedAt: { type: Date, default: Date.now },
        isImportant: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notice: Model<INotice> =
    mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);

export default Notice;
