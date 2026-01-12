import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
    authorId: mongoose.Types.ObjectId;
    type: 'traffic' | 'near_miss' | 'delivery_note' | 'sns_asset';
    title?: string;
    content: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'confirmed';
    expiresAt?: Date;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['traffic', 'near_miss', 'delivery_note', 'sns_asset'],
            required: true,
        },
        title: { type: String, default: '' }, // Added title field
        content: { type: String, required: true },
        status: {
            type: String,
            enum: ['draft', 'pending', 'approved', 'rejected', 'confirmed'],
            default: 'draft',
        },
        expiresAt: { type: Date },
        location: {
            lat: Number,
            lng: Number,
            address: String,
        },
        images: { type: [String], default: [] },
    },
    { timestamps: true }
);

// Index for TTL (Time To Live) for traffic posts
// expiresAtがセットされている場合、その時間が来たら削除される（Traffic用）
PostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Post: Model<IPost> =
    mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
