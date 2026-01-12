import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    empId: string;
    pin: string;
    name: string;
    role: 'driver' | 'office_admin' | 'safety_admin';
    subscriptions: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        empId: { type: String, required: true, unique: true },
        pin: { type: String, required: true }, // Hashed
        name: { type: String, required: true },
        role: {
            type: String,
            enum: ['driver', 'office_admin', 'safety_admin'],
            default: 'driver',
        },
        subscriptions: { type: [String], default: [] },
    },
    { timestamps: true }
);

// Prevent overwriting model during hot reloads
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
