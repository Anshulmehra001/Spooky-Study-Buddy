import multer from 'multer';
import { Request } from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createSpookyError } from './errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, `study-material-${uniqueSuffix}.${extension}`);
  }
});

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow text files and PDFs
  const allowedMimeTypes = [
    'text/plain',
    'application/pdf',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = createSpookyError(
      'Invalid file type',
      400,
      'Please upload a .txt, .pdf, .md, .doc, or .docx file'
    );
    cb(error);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 1 // Only allow one file at a time
  }
});

// Error handling wrapper for multer
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: any, next: any) => {
    const uploadHandler = upload.single(fieldName);
    
    uploadHandler(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(createSpookyError(
            'File too large',
            400,
            'Please upload a file smaller than 10MB'
          ));
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return next(createSpookyError(
            'Too many files',
            400,
            'Please upload only one file at a time'
          ));
        } else {
          return next(createSpookyError(
            'File upload error',
            400,
            'There was a problem uploading your file. Please try again.'
          ));
        }
      } else if (err) {
        return next(err);
      }
      
      next();
    });
  };
};

export { upload };