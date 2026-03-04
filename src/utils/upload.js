import multer from "multer";
import path from "path";
// Upload directory: /uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + "_" + Math.round(Math.random() * 1e9) + ext);
    },
});
export const upload = multer({ storage });