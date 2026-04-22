'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  isLoading 
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-3 w-full mt-4">
          <Button variant="secondary" className="flex-grow" onClick={onClose}>Bekor qilish</Button>
          <Button variant="danger" className="flex-grow" isLoading={isLoading} onClick={onConfirm}>Tasdiqlash</Button>
        </div>
      </div>
    </Modal>
  );
};
