/**
 * Download Handler
 *
 * Forces the browser to download a file from a URL.
 * Used for the Asset Library to download .MOV / .WEBM delivery files.
 */
export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
