import {
  TextField,
  Label,
  Input as AriaInput,
  FieldError,
  Text,
  type TextFieldProps,
} from "react-aria-components";
import styles from "./Input.module.css";

interface InputProps extends TextFieldProps {
  label?: string;
  placeholder?: string;
  description?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  className?: string;
}

export default function Input({
  label,
  placeholder,
  description,
  errorMessage,
  leftIcon,
  rightIcon,
  required,
  className,
  ...props
}: InputProps) {
  return (
    <TextField {...props} isRequired={required} className={`${styles.field} ${className ?? ""}`}>
      {label && (
        <Label className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </Label>
      )}
      <div className={styles.inputWrapper}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        <AriaInput
          placeholder={placeholder}
          className={[
            styles.input,
            leftIcon ? styles.withLeftIcon : "",
            rightIcon ? styles.withRightIcon : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
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
