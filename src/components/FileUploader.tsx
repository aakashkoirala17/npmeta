import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
}

export default function FileUploader({ 
  onFileSelect, 
  accept = "image/*", 
  multiple = false,
  title = "Click or drag image to upload",
  subtitle = "Supports JPG, PNG, WEBP. Processed locally."
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '64px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragging ? 'rgba(220, 20, 60, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}
    >
      <input 
        type="file" 
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleFileInput}
      />
      <div style={{ 
        backgroundColor: 'rgba(0, 56, 147, 0.05)', 
        padding: '16px', 
        borderRadius: '50%',
        color: 'var(--color-secondary)'
      }}>
        <UploadCloud size={40} />
      </div>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
