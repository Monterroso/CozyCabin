/**
 * FileUpload.tsx
 * File upload component with drag & drop support and file validation.
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  maxFiles?: number;
  maxSize?: number;
}

export function FileUpload({
  files,
  setFiles,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => {
      const newFiles = [...prev, ...acceptedFiles];
      return newFiles.slice(0, maxFiles);
    });
  }, [maxFiles, setFiles]);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    maxSize,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-pine-green bg-pine-green/10' : 'border-gray-300 hover:border-pine-green'}
        `}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-pine-green">Drop the files here...</p>
        ) : (
          <div className="space-y-2">
            <p>Drag and drop files here, or click to select files</p>
            <p className="text-sm text-gray-500">
              Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 bg-white rounded border"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {file.name}
                </span>
                <span className="text-sm text-gray-500">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 