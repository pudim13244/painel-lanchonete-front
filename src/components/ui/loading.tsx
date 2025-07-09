import { RefreshCw, AlertCircle } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

interface ErrorProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const Loading = ({ message = "Carregando...", size = "md" }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <RefreshCw className={`${sizeClasses[size]} animate-spin mx-auto mb-4 text-orange-500`} />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const ErrorState = ({ message, onRetry, retryText = "Tentar Novamente" }: ErrorProps) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
        <p className="text-gray-600 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
}; 