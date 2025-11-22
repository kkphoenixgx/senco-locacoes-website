import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadFolder = path.resolve(__dirname, '..', '..', '..', 'uploads');

export default {
  directory: uploadFolder,

  storage: multer.diskStorage({
    destination: uploadFolder,
    
    filename(_, file, callback) {

      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
    
  }),
};
