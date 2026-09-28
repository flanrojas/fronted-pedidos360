const dateTimeFormatter = new Intl.DateTimeFormat('es-CL', {
  dateStyle: 'short',
  timeStyle: 'short',
})

/** Formats an ISO 8601 timestamp for the UI, e.g. "25-09-2026, 13:20". */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}
