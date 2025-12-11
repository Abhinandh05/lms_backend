import multer from "multer";
import path from "path";


const storage = multer.memoryStorage();


const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];


const allowedVideoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];

// Image upload configuration (10 MB limit)
export const uploadImage = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const isImage = file.mimetype.startsWith("image/");
        const isValidExt = allowedImageExtensions.includes(ext);

        if (!isImage || !isValidExt) {
            return cb(
                new Error(
                    "Only image files are allowed! (jpg, jpeg, png, webp, gif)"
                ),
                false
            );
        }

        cb(null, true);
    },
});

// Video upload configuration (1 GB limit)
export const uploadVideo = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const isVideo = file.mimetype.startsWith("video/");
        const isValidExt = allowedVideoExtensions.includes(ext);

        if (!isVideo || !isValidExt) {
            return cb(
                new Error(
                    "Only video files are allowed! (mp4, mov, avi, mkv, webm)"
                ),
                false
            );
        }

        cb(null, true);
    },
});

// For backwards compatibility
export default uploadImage;