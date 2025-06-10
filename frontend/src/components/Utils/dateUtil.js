import { format } from "date-fns";
import isValid from "date-fns/isValid";

export function customFormatDate(inputDate, outputFormat = "MM/dd/yyyy") {
  if (!inputDate) return "";

  let dateObj;

  if (inputDate instanceof Date) {
    dateObj = inputDate;
  } else if (typeof inputDate === "string") {
    // Try to parse as a native JS Date
    dateObj = new Date(inputDate);
  } else {
    return "";
  }

  // Final validity check
  if (!isValid(dateObj)) return "";

  return format(dateObj, outputFormat);
}