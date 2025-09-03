import "../css/Modal.css";

const Modal = ({ isOpen, children, closeModal }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) closeModal();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={closeModal}>
          ❌
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
