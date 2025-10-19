const ResponseModal = ({ title, message, type = "success", onClose }) => {
  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-emerald-50",
          borderColor: "border-emerald-200",
          headerBg: "bg-emerald-50",
          iconColor: "text-emerald-600",
          textColor: "text-emerald-900",
          buttonColor: "bg-emerald-600 hover:bg-emerald-700",
        };
      case "error":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          headerBg: "bg-red-50",
          iconColor: "text-red-600",
          textColor: "text-red-900",
          buttonColor: "bg-red-600 hover:bg-red-700",
        };
      case "info":
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          headerBg: "bg-blue-50",
          iconColor: "text-blue-600",
          textColor: "text-blue-900",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        };
      default:
        return {
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200",
          headerBg: "bg-slate-50",
          iconColor: "text-slate-600",
          textColor: "text-slate-900",
          buttonColor: "bg-slate-600 hover:bg-slate-700",
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-slide-in">
        <div className={`p-6 ${config.headerBg} border-b ${config.borderColor}`}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${config.textColor}`}>
                {title}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full py-3 rounded-lg cursor-pointer font-semibold text-base transition-all text-white active:scale-95 ${config.buttonColor}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;