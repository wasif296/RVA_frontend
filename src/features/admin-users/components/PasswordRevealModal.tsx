import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '../../../design-system';

type PasswordRevealModalProps = {
  open: boolean;
  password: string;
  title?: string;
  onDismiss: () => void;
};

export function PasswordRevealModal({
  open,
  password,
  title = 'Save this password now',
  onDismiss,
}: PasswordRevealModalProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        // Cannot dismiss via backdrop/Escape — only the explicit confirm button.
        if (!next) return;
      }}
      size="md"
    >
      <ModalHeader
        title={title}
        description="This password will never be shown again. Copy it now and store it securely. If it is lost, the only recovery is a password reset."
        showClose={false}
      />
      <ModalBody className="flex flex-col gap-4">
        <pre className="overflow-x-auto rounded-md border border-border bg-neutral-100 px-4 py-3 font-sans text-base tracking-wide text-fg">
          {password}
        </pre>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            await navigator.clipboard.writeText(password);
            setCopied(true);
          }}
        >
          {copied ? 'Copied' : 'Copy password'}
        </Button>
      </ModalBody>
      <ModalFooter>
        <Button
          type="button"
          onClick={() => {
            setCopied(false);
            onDismiss();
          }}
        >
          I have saved it
        </Button>
      </ModalFooter>
    </Modal>
  );
}
