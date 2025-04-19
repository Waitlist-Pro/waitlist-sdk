import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import {
  useToast as useToastImpl,
} from "@/components/ui/use-toast"

type ToastActionProps = React.ComponentPropsWithoutRef<typeof ToastActionElement>

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionProps
}

export const useToast = useToastImpl
