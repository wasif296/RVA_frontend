import { NavLink } from 'react-router-dom';
import { Modal, ModalBody, ModalHeader } from '../../design-system';
import { cn } from '../../lib/cn';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/courses', label: 'Courses', end: false },
  { to: '/progress', label: 'My Progress', end: false },
] as const;

type MobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} size="sm">
      <ModalHeader title="Menu" description="Navigate the academy" />
      <ModalBody>
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-3 text-base font-medium',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                  isActive
                    ? 'bg-brand-100 text-brand-800'
                    : 'text-fg hover:bg-neutral-100',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </ModalBody>
    </Modal>
  );
}
