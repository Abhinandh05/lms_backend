import { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";

const bucketName = process.env.AWS_BUCKET_NAME;

// Works for both images and videos - accepts Buffer from memory
export const uploadMediaToS3 = async (fileBuffer, mimeType, fileName = null) => {
    try {
        const key = `uploads/${Date.now()}_${fileName || "media"}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            ACL: "public-read",
        });

        await s3.send(command);

        return {
            url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
            key,
        };
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw error;
    }
};

export const deleteMediaFromS3 = async (key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        await s3.send(command);
        console.log(`✅ Deleted from S3: ${key}`);
        return { success: true };
    } catch (error) {
        console.error("S3 Delete Error:", error);
        throw error;
    }
};

export const deleteMultipleMediaFromS3 = async (keys) => {
    try {
        const command = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: { Objects: keys.map((key) => ({ Key: key })) },
        });
        await s3.send(command);
        console.log("✅ Deleted multiple files from S3");
        return { success: true };
    } catch (error) {
        console.error("S3 Multi Delete Error:", error);
        throw error;
    }
};