"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { reservationSchema, type ReservationFormData, type PreOrderItem } from "@/lib/schemas/reservationSchema";
import { useCreateReservationMutation, useGetAvailableTimeSlotsQuery } from "@/lib/store/api/reservationApi";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatTime } from "@/lib/utils/formatters";
import Button from "@/components/ui/Button/Button";
import PreOrderMenu from "@/components/features/reservations/PreOrderMenu/PreOrderMenu";
import styles from "./ReservationWizard.module.css";

interface ReservationWizardProps {
  restaurantId: string;
}

const STEPS = [
  { label: "Дата та час" },
  { label: "Контакти" },
  { label: "Меню (опціонально)" },
  { label: "Підтвердження" },
];

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getMaxDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().split("T")[0];
}

export default function ReservationWizard({ restaurantId }: ReservationWizardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [createReservation, { isLoading: isSubmitting }] = useCreateReservationMutation();

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isValid },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      restaurantId,
      guestCount: 2,
      reservationDate: "",
      reservationTime: "",
      specialRequests: "",
      customerName: user ? `${user.firstName} ${user.lastName}` : "",
      customerPhone: user?.phone ?? "",
      customerEmail: user?.email ?? "",
      preOrderItems: [],
    },
  });

  const selectedDate = watch("reservationDate");
  const selectedTime = watch("reservationTime");
  const guestCount = watch("guestCount");

  const { data: timeSlots, isFetching: slotsLoading } = useGetAvailableTimeSlotsQuery(
    { restaurantId, date: selectedDate, guestCount },
    { skip: !selectedDate }
  );

  // Pre-fill from user when user loads
  useEffect(() => {
    // handled by defaultValues
  }, [user]);

  const goNext = async () => {
    let fieldsToValidate: (keyof ReservationFormData)[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ["reservationDate", "reservationTime", "guestCount"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["customerName", "customerPhone", "customerEmail"];
    }
    // Step 2 (menu) has no required fields, can skip validation
    const valid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true;
    if (valid) setCurrentStep((s) => s + 1);
  };

  const goBack = () => setCurrentStep((s) => s - 1);

  const formatTimeForApi = (time: string | number[]): string => {
    if (Array.isArray(time)) {
      return `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}`;
    }
    if (typeof time === 'string') {
      if (time.includes(':')) return time;
      return time.slice(0, 2) + ':' + time.slice(2, 4);
    }
    return "00:00";
  };

const onSubmit = async (data: ReservationFormData) => {
    console.log("onSubmit called", { data, user, isAuthenticated, preOrderItems });
    
    // Use user ID if logged in, otherwise use a default guest user ID
    try {
      console.log("Calling createReservation...");
      const result = await createReservation({
        restaurantId: data.restaurantId,
        guestCount: data.guestCount,
        reservationDate: data.reservationDate,
        reservationTime: formatTimeForApi(data.reservationTime),
        specialRequests: data.specialRequests,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
      }).unwrap();
      console.log("Reservation created:", result);
      router.push(`/reservations/${result.id}`);
    } catch (error) {
      console.error("Reservation error:", error);
    }
  };

  const formValues = watch();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Бронювання столика</h1>

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((step, idx) => (
          <div key={idx} className={styles.step}>
            {idx > 0 && (
              <div className={`${styles.stepDivider} ${idx <= currentStep ? styles.completed : ""}`} />
            )}
            <div
              className={`${styles.stepCircle} ${idx === currentStep ? styles.active : ""} ${idx < currentStep ? styles.completed : ""}`}
            >
              {idx < currentStep ? <Check size={14} strokeWidth={3} /> : idx + 1}
            </div>
            <span className={`${styles.stepLabel} ${idx === currentStep ? styles.active : ""}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.card}>
          {/* Step 1: Date, Time, Guests */}
          {currentStep === 0 && (
            <>
              <h2 className={styles.stepTitle}>Оберіть дату та час</h2>
              <div className={styles.formGrid}>
                {/* Date */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Дата <span className={styles.required}>*</span>
                  </label>
                  <Controller
                    name="reservationDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        className={styles.nativeInput}
                        min={getTodayString()}
                        max={getMaxDateString()}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.reservationDate && (
                    <span className={styles.fieldError}>{errors.reservationDate.message}</span>
                  )}
                </div>

                {/* Guest count */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Кількість гостей <span className={styles.required}>*</span>
                  </label>
                  <Controller
                    name="guestCount"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        className={styles.nativeInput}
                        min={1}
                        max={20}
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  {errors.guestCount && (
                    <span className={styles.fieldError}>{errors.guestCount.message}</span>
                  )}
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div className={styles.fieldGroup}>
                    <p className={styles.slotsTitle}>
                      Доступний час <span className={styles.required}>*</span>
                    </p>
                    {slotsLoading ? (
                      <div className={styles.slotsLoading}>Завантаження слотів...</div>
                    ) : timeSlots && timeSlots.length > 0 ? (
                      <Controller
                        name="reservationTime"
                        control={control}
                        render={({ field }) => (
                          <div className={styles.slotsGrid}>
                            {timeSlots.map((time) => (
                              <button
                                key={JSON.stringify(time)}
                                type="button"
                                className={`${styles.slotButton} ${JSON.stringify(field.value) === JSON.stringify(time) ? styles.selected : ""}`}
                                onClick={() => field.onChange(time)}
                              >
                                {Array.isArray(time) ? `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}` : formatTime(time)}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    ) : (
                      <p className={styles.noSlots}>Немає доступних слотів на цю дату</p>
                    )}
                    {errors.reservationTime && (
                      <span className={styles.fieldError}>{errors.reservationTime.message}</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 2: Contact info */}
          {currentStep === 1 && (
            <>
              <h2 className={styles.stepTitle}>Контактна інформація</h2>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Ім&apos;я <span className={styles.required}>*</span>
                  </label>
                  <Controller
                    name="customerName"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        className={styles.nativeInput}
                        placeholder="Ваше ім'я"
                        {...field}
                      />
                    )}
                  />
                  {errors.customerName && (
                    <span className={styles.fieldError}>{errors.customerName.message}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Телефон <span className={styles.required}>*</span>
                  </label>
                  <Controller
                    name="customerPhone"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="tel"
                        className={styles.nativeInput}
                        placeholder="+380XXXXXXXXX"
                        {...field}
                      />
                    )}
                  />
                  {errors.customerPhone && (
                    <span className={styles.fieldError}>{errors.customerPhone.message}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <Controller
                    name="customerEmail"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="email"
                        className={styles.nativeInput}
                        placeholder="email@example.com"
                        {...field}
                      />
                    )}
                  />
                  {errors.customerEmail && (
                    <span className={styles.fieldError}>{errors.customerEmail.message}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Особливі побажання</label>
                  <Controller
                    name="specialRequests"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className={styles.nativeInput}
                        rows={4}
                        placeholder="Алергії, особливі побажання..."
                        {...field}
                      />
                    )}
                  />
                  {errors.specialRequests && (
                    <span className={styles.fieldError}>{errors.specialRequests.message}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Pre-order menu */}
          {currentStep === 2 && (
            <PreOrderMenu
              restaurantId={restaurantId}
              selectedItems={preOrderItems}
              onItemsChange={setPreOrderItems}
            />
          )}

          {/* Step 4: Summary */}
          {currentStep === 3 && (
            <>
              <h2 className={styles.stepTitle}>Підтвердження бронювання</h2>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Дата</span>
                  <span className={styles.summaryValue}>{formValues.reservationDate}</span>
                </div>
<div className={styles.summaryRow}>
                   <span className={styles.summaryLabel}>Час</span>
                   <span className={styles.summaryValue}>
                     {selectedTime && Array.isArray(selectedTime) 
                       ? `${String(selectedTime[0]).padStart(2, '0')}:${String(selectedTime[1]).padStart(2, '0')}` 
                       : (selectedTime ? formatTime(selectedTime) : "")}
                   </span>
                 </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Кількість гостей</span>
                  <span className={styles.summaryValue}>{formValues.guestCount}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Ім&apos;я</span>
                  <span className={styles.summaryValue}>{formValues.customerName}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Телефон</span>
                  <span className={styles.summaryValue}>{formValues.customerPhone}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Email</span>
                  <span className={styles.summaryValue}>{formValues.customerEmail}</span>
                </div>
                {formValues.specialRequests && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Побажання</span>
                    <span className={styles.summaryValue}>{formValues.specialRequests}</span>
                  </div>
                )}
                {preOrderItems.length > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Попереднє замовлення</span>
                    <div className={styles.summaryPreOrder}>
                      {preOrderItems.map((item) => (
                        <div key={item.menuItemId} className={styles.preOrderItem}>
                          <span>{item.menuItemName} x{item.quantity}</span>
                          <span>{(item.price * item.quantity).toFixed(2)} грн</span>
                        </div>
                      ))}
                      <div className={styles.preOrderTotal}>
                        <strong>Разом:</strong>
                        <strong>
                          {preOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} грн
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            {currentStep > 0 && (
              <Button type="button" variant="secondary" onClick={goBack}>
                Назад
              </Button>
            )}
            {currentStep < 3 && (
              <Button type="button" onClick={goNext}>
                Далі
              </Button>
            )}
            {currentStep === 3 && (
              <Button 
                type="button" 
                onPress={async () => {
                  console.log("Button pressed, validating form...");
                  const isStep1Valid = await trigger(["reservationDate", "reservationTime", "guestCount"]);
                  const isStep2Valid = await trigger(["customerName", "customerPhone", "customerEmail"]);
                  console.log("Validation:", isStep1Valid, isStep2Valid);
                  
                  if (isStep1Valid && isStep2Valid) {
                    console.log("Calling onSubmit with current form values...");
                    const currentData = watch();
                    await onSubmit(currentData);
                    console.log("onSubmit finished");
                  }
                }}
                isDisabled={isSubmitting}
              >
                {isSubmitting ? "Завантаження..." : "Забронювати"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
