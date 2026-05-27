"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import styles from "./DateRangeSelector.module.css";

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESET_RANGES: DateRange[] = [
  {
    label: "Сьогодні",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },
  {
    label: "Вчора",
    startDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    endDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
  },
  {
    label: "Останні 7 днів",
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },
  {
    label: "Останні 30 днів",
    startDate: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },
  {
    label: "Цей місяць",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },
  {
    label: "Минулий місяць",
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
      .toISOString()
      .split("T")[0],
  },
];

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePresetClick = (range: DateRange) => {
    setIsCustom(false);
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) return;
    onChange({ label: "Власний період", startDate: customStart, endDate: customEnd });
    setIsOpen(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Calendar size={16} className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>Період:</span>
        <span className={styles.value}>{value.label}</span>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.presets}>
            {PRESET_RANGES.map((range) => (
              <button
                key={range.label}
                type="button"
                role="option"
                aria-selected={value.label === range.label}
                className={`${styles.presetButton} ${
                  value.label === range.label ? styles.active : ""
                }`}
                onClick={() => handlePresetClick(range)}
              >
                {range.label}
              </button>
            ))}
            <button
              type="button"
              role="option"
              aria-selected={isCustom}
              className={`${styles.presetButton} ${isCustom ? styles.active : ""}`}
              onClick={() => setIsCustom((v) => !v)}
            >
              Власний період
            </button>
          </div>

          {isCustom && (
            <div className={styles.customRange}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Від:</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  max={customEnd || new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>До:</label>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  min={customStart}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <button
                type="button"
                className={styles.applyButton}
                onClick={handleCustomApply}
                disabled={!customStart || !customEnd}
              >
                Застосувати
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
