import {
  Select as AriaSelect,
  SelectValue,
  Label,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
  FieldError,
  Text,
  type SelectProps as AriaSelectProps,
} from "react-aria-components";
import { ChevronDown } from "lucide-react";
import styles from "./Select.module.css";

export interface SelectOption {
  id: string | number;
  label: string;
  description?: string;
}

interface SelectProps extends Omit<AriaSelectProps<SelectOption>, "children"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function Select({
  label,
  description,
  errorMessage,
  options,
  placeholder = "Оберіть...",
  required,
  className,
  ...props
}: SelectProps) {
  return (
    <AriaSelect
      {...props}
      isRequired={required}
      className={`${styles.field} ${className ?? ""}`}
    >
      {label && (
        <Label className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      <Button className={styles.trigger}>
        <SelectValue className={styles.value}>
          {({ selectedText }) => (
            <span className={selectedText ? styles.selectedText : styles.placeholder}>
              {selectedText || placeholder}
            </span>
          )}
        </SelectValue>
        <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
      </Button>
      {description && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
      {errorMessage ? (
        <span className={styles.error}>{errorMessage}</span>
      ) : (
        <FieldError className={styles.error} />
      )}
      <Popover className={styles.popover}>
        <ListBox className={styles.listbox} items={options}>
          {(item) => (
            <ListBoxItem id={item.id} textValue={item.label} className={styles.item}>
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
