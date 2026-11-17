import EmptyState from "./EmptyState";

function ErrorState({
  title = "حدث خطأ غير متوقع",
  description = "حصلت مشكلة أثناء تنفيذ العملية. حاول مرة أخرى.",
  onRetry,
}) {
  return (
    <EmptyState
      type="error"
      title={title}
      description={description}
      buttonText={onRetry ? "إعادة المحاولة" : undefined}
      onAction={onRetry}
    />
  );
}

export default ErrorState;