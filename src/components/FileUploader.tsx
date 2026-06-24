import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Lock, KeyRound } from 'lucide-react';
import { useUsageTracker } from '../hooks/useUsageTracker';

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
  const [showPaywall, setShowPaywall] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [keyError, setKeyError] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isPro, checkAndTrackUpload, activatePro, uploadsCount, maxUploads } = useUsageTracker();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!showPaywall) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Check usage limit before allowing upload
    if (checkAndTrackUpload()) {
      onFileSelect(files[0]);
    } else {
      setShowPaywall(true);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (showPaywall) return;
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (showPaywall) return;
    processFiles(e.target.files);
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleContainerClick = () => {
    if (showPaywall) return;
    fileInputRef.current?.click();
  };

  const handleActivatePro = () => {
    if (activatePro(licenseKey)) {
      setShowPaywall(false);
      setKeyError(false);
    } else {
      setKeyError(true);
    }
  };

  if (showPaywall) {
    return (
      <div style={{
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '48px 32px',
        textAlign: 'center',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }} className="animate-fade-in">
        <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '50%', color: 'var(--color-primary)' }}>
          <Lock size={40} />
        </div>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            Daily Limit Reached
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', maxWidth: '400px', margin: '0 auto' }}>
            You've used your {maxUploads} free uploads for today. Upgrade to <strong>npmeta Pro</strong> for unlimited access.
          </p>
        </div>
        
        <div style={{ width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <button style={{ backgroundColor: 'var(--color-secondary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 600, width: '100%', fontSize: '16px' }} onClick={() => window.open('https://buy.stripe.com/test_dummy_link', '_blank')}>
            Get Pro Pass - $9.99
          </button>
          
          <div style={{ position: 'relative', marginTop: '16px' }}>
            <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', padding: '0 8px', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>OR</div>
            <hr style={{ border: 0, borderTop: '1px solid var(--color-border)' }} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-main)' }}>Already purchased?</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Enter License Key" 
                value={licenseKey}
                onChange={(e) => { setLicenseKey(e.target.value); setKeyError(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: `1px solid ${keyError ? 'var(--color-primary)' : 'var(--color-border)'}` }}
              />
              <button onClick={handleActivatePro} style={{ backgroundColor: 'var(--color-text-main)', color: 'white', padding: '0 16px', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <KeyRound size={20} />
              </button>
            </div>
            {keyError && <p style={{ color: 'var(--color-primary)', fontSize: '12px', marginTop: '8px' }}>Invalid license key.</p>}
            <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '8px' }}>Demo key: NPMETA-PRO</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleContainerClick}
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
        gap: '16px',
        position: 'relative'
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
        
        {!isPro && (
          <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>
            {maxUploads - uploadsCount} free uploads remaining today
          </div>
        )}
      </div>
    </div>
  );
}
