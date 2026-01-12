import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'rikuso-app' },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error("Upload failed"));
                }
            }
        ).end(buffer);
    });
}
