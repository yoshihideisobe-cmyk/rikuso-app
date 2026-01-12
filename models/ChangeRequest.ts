import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChangeRequest extends Document {
    userId: mongoose.Types.ObjectId;
    siteId: mongoose.Types.ObjectId;
    requestedChanges: string;
    status: 'open' | 'processed' | 'rejected';
    adminComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChangeRequestSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        siteId: { type: Schema.Types.ObjectId, ref: 'DeliverySite', required: true },
        requestedChanges: { type: String, required: true },
        status: {
            type: String,
            enum: ['open', 'processed', 'rejected'],
            default: 'open',
        },
        adminComment: { type: String },
    },
    { timestamps: true }
);

const ChangeRequest: Model<IChangeRequest> =
    mongoose.models.ChangeRequest ||
    mongoose.model<IChangeRequest>('ChangeRequest', ChangeRequestSchema);

export default ChangeRequest;
