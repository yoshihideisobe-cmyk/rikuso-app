import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeliverySite extends Document {
    siteCode: string; // Excel上のユニークキー（なければ生成）
    name: string;
    address: string;
    notes?: string;
    metadata?: Record<string, any>; // その他のカラム
    createdAt: Date;
    updatedAt: Date;
}

const DeliverySiteSchema: Schema = new Schema(
    {
        siteCode: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        address: { type: String },
        notes: { type: String },
        metadata: { type: Map, of: Schema.Types.Mixed },
    },
    { timestamps: true }
);

// 名前や住所で検索できるようにインデックス
DeliverySiteSchema.index({ name: 'text', address: 'text' });

const DeliverySite: Model<IDeliverySite> =
    mongoose.models.DeliverySite ||
    mongoose.model<IDeliverySite>('DeliverySite', DeliverySiteSchema);

export default DeliverySite;
