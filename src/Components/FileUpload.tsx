import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../supabaseClient';
import { UploadCloud, File as FileIcon, X, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  bucketName: string;
  filePath: string; // e.g., `public/${userId}` or `campaigns/promo1`
  onUploadSuccess: (filePath: string) => void;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ bucketName, filePath, onUploadSuccess, label }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadSuccess(false);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'application/pdf': [],
    },
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    const fullFilePath = `${filePath}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fullFilePath, file, { upsert: true }); // upsert allows overwriting

    setIsUploading(false);

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
    } else {
      setUploadSuccess(true);
      onUploadSuccess(fullFilePath);
      setFile(null); // Clear file after successful upload
    }
  };

  return (
    <div className="w-full space-y-4">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div {...getRootProps()} className={`relative w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-gray-600">
          <UploadCloud className="w-10 h-10" />
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <p>Drag & drop a file here, or click to select</p>
          )}
          <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF</p>
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <button onClick={() => setFile(null)} className="p-1 text-gray-500 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {uploadSuccess && <p className="text-sm text-green-600 flex items-center"><CheckCircle className="w-4 h-4 mr-2"/>Upload successful!</p>}
      
      {file && (
          <button onClick={handleUpload} disabled={isUploading} className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50">
            {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
