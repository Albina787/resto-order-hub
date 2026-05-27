"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, User } from "lucide-react";
import { useUploadFileMutation } from "@/lib/store/api/fileApi";
import { resolveImageUrl } from "@/lib/utils/imageUrl";
import Spinner from "@/components/ui/Spinner/Spinner";
import styles from "./ImageUpload.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") ?? "http://localhost:8080";

// ─── Multi-image upload ────────────────────────────────────────────────────

interface ImageUploadProps {
  label?: string;
  required?: boolean;
  value: string[];
  onChange: (urls: string[]) => void;
  directory?: string;
  maxFiles?: number;
  disabled?: boolean;
  errorMessage?: string;
}

export default function ImageUpload({
  label,
  required,
  value = [],
  onChange,
  directory,
  maxFiles = 5,
  disabled = false,
  errorMessage,
}: ImageUploadProps) {
  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setLocalError(null);

      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        setLocalError(`Максимум ${maxFiles} зображень`);
        return;
      }

      const toUpload = Array.from(files).slice(0, remaining);
      const newUrls: string[] = [];

      for (const file of toUpload) {
        try {
          const result = await uploadFile({ file, directory }).unwrap();
          newUrls.push(result.url);
        } catch {
          setLocalError("Помилка завантаження файлу");
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
      }
    },
    [uploadFile, directory, value, onChange, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  const canUploadMore = value.length < maxFiles && !disabled;

  return (
    <div className={styles.wrapper}>
      {label && (
        <span className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </span>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className={styles.previewGrid}>
          {value.map((url) => (
            <div key={url} className={styles.previewItem}>
              <Image
                src={resolveImageUrl(url)}
                alt="Зображення"
                fill
                className={styles.previewImage}
                sizes="100px"
              />
              {!disabled && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemove(url)}
                  aria-label="Видалити зображення"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canUploadMore && (
        <div
          className={[
            styles.dropzone,
            dragging ? styles.dragging : "",
            disabled ? styles.disabled : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Завантажити зображення"
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          {isLoading ? (
            <div className={styles.uploadingState}>
              <Spinner size="md" />
              <span className={styles.uploadingText}>Завантаження...</span>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
              </div>
            </div>
          ) : (
            <>
              <Upload size={32} className={styles.dropzoneIcon} />
              <p className={styles.dropzoneText}>
                Перетягніть файли сюди або{" "}
                <span className={styles.browseLink}>оберіть файли</span>
              </p>
              <p className={styles.dropzoneHint}>
                JPEG, PNG, WebP · до 5 МБ · максимум {maxFiles} файлів
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple={maxFiles > 1}
                disabled={disabled || isLoading}
                className={styles.hiddenInput}
                onChange={(e) => handleFiles(e.target.files)}
                aria-label="Вибрати зображення"
              />
            </>
          )}
        </div>
      )}

      {(errorMessage || localError) && (
        <span className={styles.error} role="alert">
          {errorMessage ?? localError}
        </span>
      )}
    </div>
  );
}

// ─── Avatar upload ─────────────────────────────────────────────────────────

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function AvatarUpload({ value, onChange, disabled = false }: AvatarUploadProps) {
  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError(null);
    try {
      const result = await uploadFile({ file, directory: "avatars" }).unwrap();
      onChange(result.url);
    } catch {
      setLocalError("Помилка завантаження аватара");
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className={styles.avatarWrapper}>
      <div className={styles.avatarPreview}>
        {value ? (
          <Image
            src={resolveImageUrl(value)}
            alt="Аватар"
            fill
            className={styles.avatarImage}
            sizes="96px"
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <User size={40} />
          </div>
        )}
      </div>

      <div className={styles.avatarActions}>
        <label className={styles.avatarUploadBtn}>
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <Upload size={16} />
          )}
          {isLoading ? "Завантаження..." : "Змінити фото"}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            disabled={disabled || isLoading}
            onChange={handleChange}
          />
        </label>
        <span className={styles.avatarHint}>JPEG, PNG, WebP · до 5 МБ</span>
        {localError && (
          <span className={styles.error} role="alert">{localError}</span>
        )}
      </div>
    </div>
  );
}
