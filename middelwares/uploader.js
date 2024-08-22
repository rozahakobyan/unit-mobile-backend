import multer from "multer";
import { v4 as uuidV4 } from "uuid";
import HttpError from "http-errors";

export default function uploader(fileTypes=[]) {
 
  return multer({
    storage: multer.diskStorage({
      filename: function (req, file, cb) {
        const filePath = `${uuidV4()}-${file.originalname}`;
        cb(null, filePath)
      }
    }),
    limits: {
      fileSize: 1024 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!file || !file.mimetype || !file.originalname) {
        cb(null, true);
        return;
      }

      if (!fileTypes.length || fileTypes.includes(file.mimetype)) {
        cb(null, true);
        return
      }

      const errorMessage = `File type '${file.mimetype}' is not allowed.`;
      cb(new HttpError(422, errorMessage), false);
    }
  })
}

uploader.image = uploader(['image/png', 'image/jpeg','image/jpg','image/svg+xml',
  'image/webp']);

// uploader.video = uploader(['video/gif', 'video/mp4', 'video/ogg', 'video/wmv', 'video/x-flv', 'video/avi',
//       'video/webm', 'video/mkv', 'video/avchd', 'video/mov']);