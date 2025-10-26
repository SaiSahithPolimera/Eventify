const ConfirmationModal = ({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}) => {
  const confirmColor = isDangerous
    ? "bg-red-600 hover:bg-red-700"
    : "bg-rose-600 hover:bg-rose-700";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-slide-in">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            {title}
          </h3>
        </div>

        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all text-white active:scale-95 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 ${confirmColor}`}
            >
              {isLoading && (
                <div role="status" className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;