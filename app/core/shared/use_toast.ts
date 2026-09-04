type ToastType = 'success' | 'error' | 'normal'

type ToastifyOptions = {
  text: string
  duration: number
  gravity: 'top' | 'bottom'
  position: 'left' | 'center' | 'right'
  stopOnFocus: boolean
  escapeMarkup: boolean
  style: Record<string, string>
}

type ToastifyInstance = {
  showToast: () => void
}

type ToastifyLibrary = (options: ToastifyOptions) => ToastifyInstance

declare global {
  interface Window {
    Toastify?: ToastifyLibrary
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export const useToast = () => {
  const showToast = (
    text: string,
    icon = 'fi-rr-info',
    type: ToastType = 'normal',
    color = '#1a1a1a',
  ) => {
    if (!import.meta.client) return

    const lib = window.Toastify

    if (!lib) {
      console.warn('Toastify n’est pas encore chargé.')
      return
    }

    const iconColor = type === 'error'
      ? '#ff4757'
      : type === 'success'
        ? '#2ecc71'
        : color

    lib({
      text: `
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="fi ${escapeHtml(icon)}" style="font-size: 20px; color: ${iconColor}; flex-shrink: 0;"></i>
          <span style="font-weight: 500; font-family: 'Inter', sans-serif; font-size: 14px;">${escapeHtml(text)}</span>
        </div>
      `,
      duration: 3500,
      gravity: 'top',
      position: 'center',
      stopOnFocus: true,
      escapeMarkup: false,
      style: {
        background: 'white',
        color: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #e7e5e5',
        padding: '10px 16px',
        maxWidth: 'calc(100% - 30px)',
        width: 'fit-content',
        display: 'inline-block',
        boxShadow: 'none',
      },
    }).showToast()
  }

  return { showToast }
}
