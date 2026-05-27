import {
  Dialog,
  DialogTrigger,
  Modal as AriaModal,
  ModalOverlay,
  Heading,
} from "react-aria-components";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: React.ReactNode;
  isDismissable?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  isDismissable = true,
}: ModalProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable={isDismissable}
      className={styles.overlay}
    >
      <AriaModal className={`${styles.modal} ${styles[size]}`}>
        <Dialog className={styles.dialog} aria-label={title ?? "Діалог"}>
          {({ close }) => (
            <>
              {title && (
                <div className={styles.header}>
                  <Heading slot="title" className={styles.title}>
                    {title}
                  </Heading>
                  <button
                    className={styles.closeButton}
                    onClick={() => { close(); onClose(); }}
                    aria-label="Закрити"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              <div className={styles.content}>{children}</div>
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}

export { DialogTrigger };
