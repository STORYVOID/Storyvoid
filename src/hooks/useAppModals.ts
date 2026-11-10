
import { useCallback, useState } from 'react';

interface MessageModal {
  isOpen: boolean;
  title: string;
  message: string;
}

export const useAppModals = () => {
  const [messageModal, setMessageModal] = useState<MessageModal>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [isCoinStoreOpen, setIsCoinStoreOpen] = useState(false);

  const showMessage = useCallback(
    (title: string, message: string) => {
      setMessageModal({
        isOpen: true,
        title,
        message,
      });
    },
    []
  );

  const closeMessage = useCallback(() => {
    setMessageModal((previous) => ({
      ...previous,
      isOpen: false,
    }));
  }, []);

  return {
    messageModal,
    setMessageModal,
    showMessage,
    closeMessage,
    isCoinStoreOpen,
    setIsCoinStoreOpen,
  };
};
                                   
