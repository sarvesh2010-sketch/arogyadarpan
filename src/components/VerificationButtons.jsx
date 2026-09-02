import { Check, Edit3, X } from 'lucide-react'
import Button from './Button'

export default function VerificationButtons({
  onConfirm,
  onEdit,
  onReject,
  status = 'unverified',
  size = 'sm',
  className = '',
}) {
  if (status === 'doctor_confirmed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
        <Check className="w-4 h-4" /> Verified
      </span>
    )
  }

  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium">
        <X className="w-4 h-4" /> Rejected
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onConfirm && (
        <Button
          variant="success"
          size={size}
          icon={Check}
          onClick={onConfirm}
        >
          Confirm
        </Button>
      )}
      {onEdit && (
        <Button
          variant="secondary"
          size={size}
          icon={Edit3}
          onClick={onEdit}
        >
          Edit
        </Button>
      )}
      {onReject && (
        <Button
          variant="ghost"
          size={size}
          icon={X}
          onClick={onReject}
          className="text-red-500 hover:bg-red-50"
        >
          Reject
        </Button>
      )}
    </div>
  )
}
