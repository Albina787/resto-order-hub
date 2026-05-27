"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from "@/lib/store/api/userApi";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/schemas/authSchema";
import { useAppDispatch } from "@/lib/store/hooks";
import { logoutAndClearCache } from "@/lib/store/slices/authSlice";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";
import { PageSpinner } from "@/components/ui/Spinner/Spinner";
import ErrorMessage from "@/components/shared/ErrorMessage/ErrorMessage";
import { AvatarUpload } from "@/components/ui/ImageUpload/ImageUpload";
import styles from "./ProfilePage.module.css";

const profileSchema = z.object({
  firstName: z.string().min(2, "Мінімум 2 символи").max(100),
  lastName: z.string().min(2, "Мінімум 2 символи").max(100),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Введіть коректний номер телефону")
    .optional()
    .or(z.literal("")),
  avatar: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      phone: profile?.phone ?? "",
      avatar: profile?.avatar ?? "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data).unwrap();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      // handled by RTK Query
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      passwordForm.reset();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      // handled by RTK Query
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      
      // Wait for backend logout to complete
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (error) {
        console.error("Logout request failed:", error);
      }
      
      // Clear all frontend state and cache
      dispatch(logoutAndClearCache());
      
      // Redirect to home
      router.push("/");
      router.refresh();
    } catch {
      // handled by RTK Query
    }
  };

  if (isLoading) return <PageSpinner />;
  if (isError) {
    return (
      <div className={styles.container}>
        <ErrorMessage title="Не вдалося завантажити профіль" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Мій профіль</h1>

      {/* Profile Info */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Особиста інформація</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <div className={styles.avatarSection}>
            <Controller
              name="avatar"
              control={profileForm.control}
              render={({ field }) => (
                <AvatarUpload
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isUpdating}
                />
              )}
            />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Ім&apos;я</label>
              <Controller
                name="firstName"
                control={profileForm.control}
                render={({ field }) => (
                  <input type="text" className={styles.nativeInput} {...field} />
                )}
              />
              {profileForm.formState.errors.firstName && (
                <span className={styles.fieldError}>
                  {profileForm.formState.errors.firstName.message}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Прізвище</label>
              <Controller
                name="lastName"
                control={profileForm.control}
                render={({ field }) => (
                  <input type="text" className={styles.nativeInput} {...field} />
                )}
              />
              {profileForm.formState.errors.lastName && (
                <span className={styles.fieldError}>
                  {profileForm.formState.errors.lastName.message}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Телефон</label>
              <Controller
                name="phone"
                control={profileForm.control}
                render={({ field }) => (
                  <input type="tel" className={styles.nativeInput} placeholder="+380XXXXXXXXX" {...field} />
                )}
              />
              {profileForm.formState.errors.phone && (
                <span className={styles.fieldError}>
                  {profileForm.formState.errors.phone.message}
                </span>
              )}
            </div>
          </div>

          {profileSuccess && (
            <p className={styles.successMessage}>Профіль успішно оновлено!</p>
          )}

          <div className={styles.formActions}>
            <Button type="submit" isLoading={isUpdating}>
              Зберегти зміни
            </Button>
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Зміна пароля</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Поточний пароль</label>
              <Controller
                name="currentPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input type="password" className={styles.nativeInput} {...field} />
                )}
              />
              {passwordForm.formState.errors.currentPassword && (
                <span className={styles.fieldError}>
                  {passwordForm.formState.errors.currentPassword.message}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Новий пароль</label>
              <Controller
                name="newPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input type="password" className={styles.nativeInput} {...field} />
                )}
              />
              {passwordForm.formState.errors.newPassword && (
                <span className={styles.fieldError}>
                  {passwordForm.formState.errors.newPassword.message}
                </span>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Підтвердіть новий пароль</label>
              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <input type="password" className={styles.nativeInput} {...field} />
                )}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <span className={styles.fieldError}>
                  {passwordForm.formState.errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          {passwordSuccess && (
            <p className={styles.successMessage}>Пароль успішно змінено!</p>
          )}

          <div className={styles.formActions}>
            <Button type="submit" isLoading={isChangingPassword}>
              Змінити пароль
            </Button>
          </div>
        </form>
      </section>

      {/* Danger Zone */}
      <section className={styles.dangerZone}>
        <h2 className={styles.dangerTitle}>Небезпечна зона</h2>
        <p className={styles.dangerDescription}>
          Видалення акаунту є незворотньою дією. Всі ваші дані будуть видалені.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Видалити акаунт
        </Button>
      </section>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Видалення акаунту"
        size="sm"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalText}>
            Ви впевнені, що хочете видалити свій акаунт? Ця дія незворотня і всі ваші дані будуть видалені.
          </p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Скасувати
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDeleteAccount}>
              Видалити акаунт
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
