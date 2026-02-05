export function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
      <p>{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-600 hover:text-red-800 font-medium">
          Dismiss
        </button>
      )}
    </div>
  );
}
