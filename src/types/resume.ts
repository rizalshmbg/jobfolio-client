export type Resume = {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type ResumeResponse = {
  success: boolean;
  message: string;
  data: Resume;
};

export type DeleteResumeResponse = {
  success: boolean;
  message: string;
};
