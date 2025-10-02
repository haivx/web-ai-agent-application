'use client';

import { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  getUrl?: string;
};

type PresignedUpload = {
  key: string;
  putUrl: string;
  getUrl: string;
  contentType: string;
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) {
    return `${bytes} B`;
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  const decimals = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

export default function Uploader() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const updateUpload = useCallback((id: string, patch: Partial<UploadItem>) => {
    setUploads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }, []);

  const uploadWithXhr = useCallback(
    (id: string, file: File, presigned: PresignedUpload) =>
      new Promise<void>((resolve, reject) => {
        updateUpload(id, {
          status: 'uploading',
          progress: 0,
          error: undefined,
          getUrl: undefined,
        });

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presigned.putUrl, true);
        xhr.setRequestHeader('Content-Type', presigned.contentType);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.round((event.loaded / event.total) * 100);
            updateUpload(id, { progress: percent });
          }
        };

        xhr.onerror = () => {
          const message = 'Network error while uploading file.';
          updateUpload(id, { status: 'error', error: message });
          reject(new Error(message));
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            updateUpload(id, { progress: 100, status: 'done', getUrl: presigned.getUrl });
            resolve();
          } else {
            const message = `Upload failed with status ${xhr.status}.`;
            updateUpload(id, { status: 'error', error: message });
            reject(new Error(message));
          }
        };

        xhr.send(file);
      }),
    [updateUpload]
  );

  const handleDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const description = fileRejections
      .map((rejection) =>
        rejection.errors.map((err) => `${rejection.file.name}: ${err.message}`).join(', ')
      )
      .join(', ');
    window.alert(description || 'Some files were rejected. Please upload images only.');
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }

      const initialItems: UploadItem[] = acceptedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        progress: 0,
        status: 'pending',
      }));

      setUploads(initialItems);
      setIsUploading(true);

      try {
        const response = await fetch('/api/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            count: acceptedFiles.length,
            contentTypes: acceptedFiles.map((file) => file.type),
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          const message = (payload && payload.message) || 'Failed to request upload URLs.';
          throw new Error(message);
        }

        if (!Array.isArray(payload) || payload.length !== acceptedFiles.length) {
          throw new Error('Unexpected response from upload endpoint.');
        }

        const uploadsResult = await Promise.allSettled(
          payload.map((item, index) => {
            if (
              typeof item !== 'object' ||
              item === null ||
              typeof item.putUrl !== 'string' ||
              typeof item.getUrl !== 'string' ||
              typeof item.key !== 'string' ||
              typeof item.contentType !== 'string'
            ) {
              return Promise.reject<void>(new Error('Malformed upload response.'));
            }

            const presigned: PresignedUpload = {
              key: item.key,
              putUrl: item.putUrl,
              getUrl: item.getUrl,
              contentType: item.contentType,
            };

            return uploadWithXhr(initialItems[index].id, acceptedFiles[index], presigned);
          })
        );

        const firstError = uploadsResult.find(
          (result): result is PromiseRejectedResult => result.status === 'rejected'
        );

        if (firstError) {
          const message =
            firstError.reason instanceof Error
              ? firstError.reason.message
              : 'One or more uploads failed.';
          throw new Error(message);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed.';
        setUploads((prev) =>
          prev.map((item) =>
            item.status === 'done' ? item : { ...item, status: 'error', error: message }
          )
        );
        window.alert(message);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadWithXhr]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: handleDropRejected,
    accept: { 'image/*': [] },
    multiple: true,
    disabled: isUploading,
  });

  return (
    <section>
      <div
        {...getRootProps({
          className: 'uploader-dropzone',
          style: {
            border: '2px dashed #888',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: isDragActive ? '#f0f6ff' : '#fafafa',
            color: '#333',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            outline: 'none',
          },
          tabIndex: 0,
        })}
        aria-busy={isUploading}
      >
        <input {...getInputProps()} />
        <p style={{ fontSize: '1rem', margin: 0 }}>
          {isDragActive ? 'Drop the images here…' : 'Drag and drop images here, or click to browse.'}
        </p>
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          {isUploading
            ? `Uploading ${uploads.length} file${uploads.length === 1 ? '' : 's'}…`
            : 'Only image files are supported.'}
        </p>
      </div>

      {uploads.length > 0 && (
        <ul style={{ listStyle: 'none', marginTop: '1.5rem', padding: 0 }}>
          {uploads.map((item) => (
            <li
              key={item.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <strong style={{ display: 'block' }}>{item.file.name}</strong>
                  <span style={{ color: '#666' }}>{formatBytes(item.file.size)}</span>
                </div>
                {item.getUrl && item.status === 'done' && (
                  <a
                    href={item.getUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1d4ed8' }}
                  >
                    Preview
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <progress value={item.progress} max={100} style={{ width: '100%' }} />
                <span aria-live="polite">
                  {item.status === 'uploading'
                    ? `Uploading… ${item.progress}%`
                    : item.status === 'done'
                    ? 'Upload complete'
                    : item.status === 'error'
                    ? `Error: ${item.error ?? 'Upload failed.'}`
                    : 'Waiting to upload'}
                </span>
              </div>
              {item.error && item.status === 'error' && (
                <span role="alert" style={{ color: '#b91c1c' }}>
                  {item.error}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
