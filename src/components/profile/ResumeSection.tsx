import { useRef } from 'react';
import { FileText, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import {
  useDeleteResume,
  useResume,
  useUploadResume,
} from '@/hooks/use-resume';
import { resumeFileSchema } from '@validations/resume.validation';
import { getApiErrorMessage } from '@/utils/get-api-error.message';
import { Button } from '@/components/ui/button';

const formatFileSize = (fileSize: number) => {
  if (fileSize < 1024) {
    return `${fileSize} B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumeSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  const resumeQuery = useResume();
  const uploadMutation = useUploadResume();
  const deleteMutation = useDeleteResume();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validation = resumeFileSchema.safeParse(file);

    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message);
      event.target.value = '';

      return;
    }

    try {
      await uploadMutation.mutateAsync(file);

      toast.success(
        resumeQuery.data
          ? 'Resume replaced successfully.'
          : 'Resume uploaded successfully.',
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload resume.'));
    } finally {
      event.target.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      deleteDialog.current?.close();
      toast.success('Resume deleted successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete resume.'));
    }
  };

  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isBusy = isUploading || isDeleting;

  if (resumeQuery.isPending) {
    return (
      <section className='panel'>
        <div className='form-section-heading'>
          <span className='section-icon'>
            <FileText size={19} />
          </span>
          <div>
            <h2>Resume</h2>
            <p>Keep your latest resume ready for your next opportunity.</p>
          </div>
        </div>

        <div className='flex items-center gap-2 p-6 text-sm text-muted-foreground'>
          <LoaderCircle size={16} className='animate-spin' />
          Loading resume...
        </div>
      </section>
    );
  }

  if (resumeQuery.isError) {
    return (
      <section className='panel'>
        <div className='form-section-heading'>
          <span className='section-icon'>
            <FileText size={19} />
          </span>
          <div>
            <h2>Resume</h2>
            <p>Keep your latest resume ready for your next opportunity.</p>
          </div>
        </div>

        <div className='p-6'>
          <p className='text-sm text-destructive'>
            {getApiErrorMessage(resumeQuery.error, 'Failed to load resume.')}
          </p>

          <Button
            type='button'
            className='mt-4'
            onClick={() => void resumeQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      </section>
    );
  }

  const resume = resumeQuery.data;

  return (
    <>
      <section className='panel'>
        <div className='form-section-heading'>
          <span className='section-icon'>
            <FileText size={19} />
          </span>

          <div>
            <h2>Resume</h2>
            <p>Keep your latest resume ready for your next opportunity.</p>
          </div>
        </div>

        <div className='p-6'>
          <input
            ref={fileInputRef}
            type='file'
            accept='.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            className='hidden'
            onChange={handleFileChange}
            disabled={isBusy}
          />

          {resume ? (
            <div className='flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex min-w-0 items-center gap-3'>
                <div className='flex size-10 shrink-0 items-center justify-center rounded-md bg-muted'>
                  <FileText size={20} />
                </div>

                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>
                    {resume.fileName}
                  </p>

                  <p className='text-xs text-muted-foreground'>
                    {formatFileSize(resume.fileSize)}
                  </p>
                </div>
              </div>

              <div className='flex shrink-0 gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => window.open(resume.url, '_blank')}
                  disabled={isBusy}
                >
                  View
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  onClick={handleUploadClick}
                  disabled={isBusy}
                >
                  {isUploading ? (
                    <LoaderCircle className='animate-spin' />
                  ) : (
                    <Upload size={16} />
                  )}
                  {isUploading ? 'Uploading...' : 'Replace'}
                </Button>

                <Button
                  type='button'
                  variant='destructive'
                  onClick={() => {
                    deleteMutation.reset();
                    deleteDialog.current?.showModal();
                  }}
                  disabled={isBusy}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className='rounded-lg border border-dashed p-6 text-center'>
              <FileText
                size={32}
                className='mx-auto mb-3 text-muted-foreground'
              />

              <h3 className='text-sm font-medium'>No resume uploaded</h3>

              <p className='mt-1 text-xs text-muted-foreground'>
                Upload a PDF, DOC, or DOCX file up to 5 MB.
              </p>

              <Button
                type='button'
                className='mt-4'
                onClick={handleUploadClick}
                disabled={isBusy}
              >
                {isUploading ? (
                  <LoaderCircle className='animate-spin' />
                ) : (
                  <Upload size={16} />
                )}
                {isUploading ? 'Uploading...' : 'Upload resume'}
              </Button>
            </div>
          )}
        </div>
      </section>
      <dialog
        ref={deleteDialog}
        className='delete-dialog'
        aria-labelledby='delete-resume-title'
        aria-describedby='delete-resume-description'
        onCancel={(event) => {
          if (deleteMutation.isPending) {
            event.preventDefault();
          }
        }}
      >
        <span className='mb-5 flex size-11 items-center justify-center rounded-xl bg-red-50 text-destructive'>
          <Trash2 size={21} />
        </span>

        <h2
          id='delete-resume-title'
          className='text-lg font-semibold tracking-tight'
        >
          Delete this resume?
        </h2>

        <p
          id='delete-resume-description'
          className='mt-3 mb-6 text-sm leading-6 text-muted-foreground'
        >
          This will permanently remove your uploaded resume
          {resume ? (
            <>
              {' '}
              <strong className='font-medium text-foreground'>
                {resume.fileName}
              </strong>
            </>
          ) : null}
          .
        </p>

        <div className='flex justify-end gap-3'>
          <Button
            autoFocus
            variant='outline'
            disabled={deleteMutation.isPending}
            onClick={() => deleteDialog.current?.close()}
          >
            Keep resume
          </Button>

          <Button
            variant='destructive'
            disabled={deleteMutation.isPending}
            onClick={() => void handleDelete()}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete resume'}
          </Button>
        </div>
      </dialog>
    </>
  );
};

export default ResumeSection;
