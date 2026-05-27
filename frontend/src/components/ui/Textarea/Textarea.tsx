import {
  TextField,
  Label,
  TextArea,
  FieldError,
  Text,
  type TextFieldProps,
} from "react-aria-components";
import styles from "./Textarea.module.css";

interface TextareaProps extends TextFieldProps {
  label?: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

export default function Textarea({
  label,
  placeholder,
  description,
  errorMessage,
  rows = 4,
  required,
  className,
  ...props
}: TextareaProps) {
  return (
    <TextField {...props} isRequired={required} className={`${styles.field} ${className ?? ""}`}>
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
      <TextArea
        placeholder={placeholder}
        rows={rows}
        className={styles.textarea}
      />
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
    </TextField>
  );
}
