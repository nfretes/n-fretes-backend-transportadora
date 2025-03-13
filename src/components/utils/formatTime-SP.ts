import { toZonedTime } from 'date-fns-tz';
import { addHours } from 'date-fns';

export function convertToSaoPauloTime(date: Date): Date {
  const timeZone = 'America/Sao_Paulo';

  const saoPauloTime = toZonedTime(date, timeZone);

  return saoPauloTime;
}

export function addHoursToSaoPauloTime(date: Date, hours: number): Date {
  const saoPauloTime = convertToSaoPauloTime(date);
  
  return addHours(saoPauloTime, hours);
}
