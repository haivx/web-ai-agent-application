'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';

type UploadItem = {
  file: File;
  key?: string;
  putUrl?: string;
  getUrl?: string;
  progress: number;
  status: 'idle' | 'uploading' | 'done' | 'error';
  error?: string;
};

type Presigned = { key: string; putUrl: string; getUrl: string; contentType: string };

export default function Uploader() {
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [jobStatus, setJobStatus] = React.useState<{ status: string; progress: number } | null>(null);
  const [busy, setBusy] = React.useState(false);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const next = acceptedFiles.map<UploadItem>((f) => ({
      file: f,
      progress: 0,
      status: 'idle',
    }));
    setItems(next);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'] },
    onDrop,
    multiple: true,
  });

  async function requestPresigned(files: File[]): Promise<Presigned[]> {
    const body = {
      count: files.length,
      contentTypes: files.map((f) => f.type || 'application/octet-stream'),
    };
    const res = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.json().catch(() => ({}));
      throw new Error(t?.message || 'Failed to get presigned URLs');
    }
    const data = (await res.json()) as Presigned[];
    return data;
  }

  function uploadWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(file);
    });
  }

  async function handleStartUpload() {
    try {
      setBusy(true);
      const files = items.map((i) => i.file);
      const presigned = await requestPresigned(files);

      // map presigned to items and PUT
      const updated = [...items];
      for (let i = 0; i < updated.length; i++) {
        const it = updated[i];
        const p = presigned[i];
        it.key = p.key;
        it.putUrl = p.putUrl;
        it.getUrl = p.getUrl;
        it.status = 'uploading';
        setItems([...updated]);

        try {
          await uploadWithProgress(p.putUrl, it.file, (pct) => {
            updated[i].progress = pct;
            setItems([...updated]);
          });
          updated[i].status = 'done';
          updated[i].progress = 100;
          setItems([...updated]);
        } catch (e: any) {
          updated[i].status = 'error';
          updated[i].error = e?.message || 'Upload failed';
          setItems([...updated]);
        }
      }

      // After all uploads, call ingest
      const okItems = updated.filter((x) => x.status === 'done' && x.key);
      if (okItems.length) {
        const body = { photos: okItems.map((x) => ({ key: x.key!, contentType: x.file.type })) };
        const res = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const { jobId } = (await res.json()) as { jobId: string };
          setJobId(jobId);
        } else {
          console.error('ingest failed', await res.text());
        }
      }
    } finally {
      setBusy(false);
    }
  }

  // Poll job status
  React.useEffect(() => {
    if (!jobId) return;
    let timer: any;
    const tick = async () => {
      const res = await fetch(`/api/jobs/${jobId}/status`);
      if (!res.ok) return;
      const data = (await res.json()) as { status: string; progress: number };
      setJobStatus(data);
      if (data.status !== 'completed') {
        timer = setTimeout(tick, 1000);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, [jobId]);

  const canStart = items.length > 0 && !busy && items.every((i) => i.status === 'idle' || i.status === 'error');

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold">Upload photos</h2>
      <div
        {...getRootProps()}
        style={{
          marginTop: 12,
          padding: 20,
          border: '2px dashed #aaa',
          borderRadius: 8,
          background: isDragActive ? '#fafafa' : '#fff',
          cursor: 'pointer',
        }}
        aria-label="Drop photos here"
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Thả ảnh vào đây…</p> : <p>Kéo & thả ảnh vào đây, hoặc bấm để chọn</p>}
      </div>

      <div style={{ marginTop: 16 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14 }}>
                {it.file.name} ({Math.round(it.file.size / 1024)} KB)
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>{it.status}</div>
              <div aria-live="polite" style={{ height: 8, background: '#eee', borderRadius: 4, marginTop: 6 }}>
                <div
                  style={{
                    width: `${it.progress}%`,
                    height: 8,
                    borderRadius: 4,
                    background: '#4a90e2',
                    transition: 'width 200ms',
                  }}
                />
              </div>
            </div>
            {it.getUrl && it.status === 'done' && (
              <a href={it.getUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                Preview
              </a>
            )}
            {it.status === 'error' && <span style={{ color: 'red', fontSize: 12 }}>{it.error}</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={handleStartUpload}
          disabled={!canStart}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: canStart ? '#111' : '#999',
            color: '#fff',
          }}
        >
          Start upload & ingest
        </button>
      </div>

      {jobId && (
        <div style={{ marginTop: 16 }}>
          <div>
            Job: <code>{jobId}</code>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 10, background: '#eee', borderRadius: 6 }}>
              <div
                style={{
                  height: 10,
                  width: `${jobStatus?.progress ?? 0}%`,
                  background: '#0a7',
                  borderRadius: 6,
                  transition: 'width 300ms',
                }}
              />
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {jobStatus ? `${jobStatus.progress}% — ${jobStatus.status}` : 'Starting…'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
