import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={() => onOpenChange?.(false)}
      />
      {/* Content */}
      <div className="relative z-50">
        {children}
      </div>
    </div>
  )
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative bg-surface border border-stroke rounded-lg shadow-lg max-w-lg w-full mx-4 animate-slide-up",
      className
    )}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {children}
  </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: DialogHeaderProps) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-heading-2 text-text-primary font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-secondary text-text-secondary", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
}