import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'info' | 'success' | 'error' | 'warning'
  onConfirm?: () => void
  confirmText?: string
  showCancel?: boolean
  cancelText?: string
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = 'OK',
  showCancel = false,
  cancelText = 'Cancelar',
}: AlertModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-[#5C4A1F]" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-[#5C4A1F]" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-[#5C4A1F]" />
      default:
        return <Info className="w-6 h-6 text-[#5C4A1F]" />
    }
  }

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return 'bg-[#E8F5E9]'
      case 'error':
        return 'bg-[#FFEBEE]'
      case 'warning':
        return 'bg-[#FFF3E0]'
      default:
        return 'bg-[#FFBD59]'
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F5E6C3] border-2 border-[#5C4A1F] rounded-3xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className={`${getHeaderColor()} p-6 rounded-t-3xl border-b-2 border-[#5C4A1F] flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F5E6C3] rounded-full">
              {getIcon()}
            </div>
            <h3 className="text-2xl font-bold text-[#5C4A1F]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5C4A1F] hover:bg-[#F5B563] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#8B6914] text-base leading-relaxed mb-6 whitespace-pre-line">
            {message}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {showCancel && (
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-[#FFF1BA] hover:bg-[#F5E6C3] text-[#5C4A1F] font-semibold rounded-xl border-2 border-[#5C4A1F] px-6 py-2"
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              className="bg-[#FFBD59] hover:bg-[#F5B563] text-[#5C4A1F] font-bold rounded-xl border-2 border-[#5C4A1F] px-6 py-2 shadow-md hover:shadow-lg transition-all"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

