'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadTarget {
  key: string;
  putUrl: string;
  getUrl: string;
}

interface JobStatus {
  status: string;
  progress: number;
}

export function PhotoDropzone() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) {
      return;
    }

    setProgress(0);
    setJobId(null);
    setJobStatus(null);
    setIsUploading(true);

    try {
      const contentTypes = Array.from(new Set(acceptedFiles.map((file) => file.type || 'application/octet-stream')));
      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: acceptedFiles.length, contentTypes })
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to create upload URLs');
      }

      const targets = (await uploadResponse.json()) as UploadTarget[];

      let completed = 0;
      const totalSteps = targets.length + 1; // uploads + ingest

      await Promise.all(
        targets.map(async (target, index) => {
          const file = acceptedFiles[index];
          await fetch(target.putUrl, {
            method: 'PUT',
            body: file
          });
          completed += 1;
          setProgress(Math.round((completed / totalSteps) * 100));
        })
      );

      const ingestResponse = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: targets.map((target) => ({ key: target.key, url: target.getUrl })) })
      });

      if (!ingestResponse.ok) {
        throw new Error('Failed to start ingest job');
      }

      const ingestPayload = (await ingestResponse.json()) as { jobId: string };
      setJobId(ingestPayload.jobId);
      completed += 1;
      setProgress(Math.round((completed / totalSteps) * 100));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error(message);
      setIsUploading(false);
    }
  }, []);

  useEffect(() => {
    if (!jobId) {
      setIsUploading(false);
      return;
    }

    const interval = setInterval(async () => {
      const response = await fetch(`/api/jobs/${jobId}/status`);
      if (!response.ok) {
        toast.error('Failed to fetch job status');
        return;
      }

      const status = (await response.json()) as JobStatus;
      setJobStatus(status);
      setProgress(status.progress);

      if (status.progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        toast.success('Ingest job completed');
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const statusLabel = useMemo(() => {
    if (isUploading) {
      return 'Uploading...';
    }

    if (jobStatus) {
      return `Job status: ${jobStatus.status}`;
    }

    return 'Drop photos here or click to browse';
  }, [isUploading, jobStatus]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps({
          className: 'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-900/40 px-8 py-12 text-center transition hover:border-emerald-500'
        })}
      >
        <input {...getInputProps()} />
        <p className="text-lg font-medium">{statusLabel}</p>
        <p className="text-sm text-neutral-400">
          {isDragActive ? 'Release to upload your photos' : 'Supports JPEG and PNG images for now'}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Progress</span>
          <span className="text-sm font-medium text-neutral-200">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {jobId ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-300">
          <div className="font-semibold text-neutral-100">Job ID</div>
          <code className="block break-all text-xs text-emerald-400">{jobId}</code>
          {jobStatus && <p className="mt-2 text-neutral-400">Status: {jobStatus.status}</p>}
        </div>
      ) : (
        <Button type="button" disabled>
          Waiting for upload...
        </Button>
      )}
    </div>
  );
}
