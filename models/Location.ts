import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILocation extends Document {
    sheet_name: string;
    company: string;
    address: string;
    tel: string;
    search_text: string;
    url: string;
    updated_at: string;
}

// Check if model allows for loose schema or strict. 
// User provided schema is specific.
const LocationSchema: Schema = new Schema(
    {
        sheet_name: { type: String, required: true },
        company: { type: String, default: '' },
        address: { type: String, default: '' },
        tel: { type: String, default: '' },
        search_text: { type: String, required: true, index: true }, // Index for text search if needed, but regex will be used
        url: { type: String, required: true },
        updated_at: { type: String }
    },
    { collection: 'locations' } // Explicitly match the collection name 'locations'
);

const Location: Model<ILocation> =
    mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default Location;
