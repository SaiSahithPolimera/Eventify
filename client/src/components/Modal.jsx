const Modal = ({ show, onClose, title, children, maxWidth = "max-w-2xl" }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className={`bg-white rounded-lg p-8 w-full ${maxWidth} max-h-[90vh] overflow-y-auto relative shadow-xl`}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-slate-100 transition-colors cursor-pointer"
                >
                    ×
                </button>
                {title && (
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">{title}</h2>
                )}
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;