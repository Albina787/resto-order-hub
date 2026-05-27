import { baseApi } from "./baseApi";
import type { FileResponse } from "@/types/file";

export const fileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<FileResponse, { file: File; directory?: string }>({
      query: ({ file, directory }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (directory) formData.append("directory", directory);
        return {
          url: "/files/upload",
          method: "POST",
          body: formData,
          // FormData body — fetchBaseQuery will NOT set Content-Type,
          // letting the browser set multipart/form-data with boundary
        };
      },
    }),
    deleteFile: builder.mutation<void, string>({
      query: (url) => ({
        url: `/files?url=${encodeURIComponent(url)}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useUploadFileMutation, useDeleteFileMutation } = fileApi;
