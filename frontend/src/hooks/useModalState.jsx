import { useState } from "react";

const useModalManager = () => {
  //un objeto de modales
  const [modals, setModals] = useState({});

  //cambia el valor solo del modal llamado por su nombre
  const openModal = (name) => setModals((prev) => ({ ...prev, [name]: true }));
  const closeModal = (name) =>
    setModals((prev) => ({ ...prev, [name]: false }));

  //el !! es para devolver un booleano claro si es undifined va a ser false
  const isOpen = (name) => !!modals[name];

  return { isOpen, openModal, closeModal };
};

export default useModalManager;
