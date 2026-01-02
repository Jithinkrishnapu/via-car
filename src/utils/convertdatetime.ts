import { formatISO, parse } from "date-fns"

export function combineDateAndTimeToUTC(dateString: string, timeString: string): string {
    // Parse combined date and time in local timezone
    const parsedDate = parse(`${dateString} ${timeString}`, 'yyyy-MM-dd h:mm a', new Date())
  
    // Convert to ISO string in UTC
    return formatISO(parsedDate, { representation: 'complete' })
  }