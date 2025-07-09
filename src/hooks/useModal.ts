import { useState, useCallback, useEffect } from 'react';

interface UseModalOptions {
  delay?: number;
  onOpen?: () => void;
  onClose?: () => void;
}

export const useModal = (options: UseModalOptions = {}) => {
  const { delay = 300, onOpen, onClose } = options;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Controlar montagem/desmontagem do modal
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      onOpen?.();
    } else {
      const timer = setTimeout(() => {
        setIsMounted(false);
        onClose?.();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, delay, onOpen, onClose]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    isMounted,
    open,
    close,
    toggle
  };
}; 