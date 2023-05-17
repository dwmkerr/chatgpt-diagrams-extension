declare global {
  interface Window {
    XPath: (...args: any[]) => void
    dataLayer: Record<string, any>
  }
}
