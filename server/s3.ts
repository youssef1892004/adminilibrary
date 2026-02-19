import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

// Wasabi S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "eu-south-1",
    endpoint: process.env.AWS_S3_ENDPOINT || "https://s3.eu-south-1.wasabisys.com",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "voicestudio";

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials missing from environment variables");
}

export async function uploadToS3(file: Express.Multer.File, folder: string = "books"): Promise<string> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename to remove spaces and special characters
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
    const key = `${folder}/${uniqueSuffix}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Remove ACL as it might be causing issues if bucket doesn't support it
        // ACL: "public-read", 
    });

    try {
        await s3Client.send(command);
        // Return local proxy URL instead of direct S3 URL
        return `/api/uploads/${folder}/${uniqueSuffix}-${sanitizedFilename}`;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw new Error("Failed to upload file to S3");
    }
}

export async function retrieveFileFromS3(key: string): Promise<any> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    try {
        const response = await s3Client.send(command);
        return response.Body;
    } catch (error) {
        console.error("Error retrieving from S3:", error);
        throw error;
    }
}
