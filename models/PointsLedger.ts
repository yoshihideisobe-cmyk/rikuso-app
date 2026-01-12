import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPointsLedger extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    reason: string;
    relatedId?: mongoose.Types.ObjectId; // Post or Request ID
    createdAt: Date;
}

const PointsLedgerSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        reason: { type: String, required: true },
        relatedId: { type: Schema.Types.ObjectId },
    },
    { timestamps: true }
);

const PointsLedger: Model<IPointsLedger> =
    mongoose.models.PointsLedger ||
    mongoose.model<IPointsLedger>('PointsLedger', PointsLedgerSchema);

export default PointsLedger;
