import "../styles/PopupModal.css";

interface PopupModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function PopupModal({ title, onClose, children }: PopupModalProps) {
    return (
        <div className="popup-overlay" onClick={onClose}>
        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <header className="popup-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="close-btn">×</button>
            </header>
            <div className="popup-body">{children}</div>
        </div>
        </div>
    );
}
