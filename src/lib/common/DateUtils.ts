
export class DateUtils {
    /**
     * Convert a string with format 'YYYYMMDD HH:mm:ss.sss' to an ISO String format, then returns a 
     * Date object with the parsed date
     * @param  {string} strDate The string to convert
     * @return {Date}      Returns the parsed date
     */
    static convertCustomFormatToDate(strDate: string): Date {
        const YYYY = strDate.slice(0, 4);
        const MM = strDate.slice(4, 6);
        const DD = strDate.slice(6, 8);
        const HH = strDate.slice(9, 11);
        const mm = strDate.slice(12, 14);
        const ss = strDate.slice(15, 17);
        const sss = strDate.slice(18);
        const iso = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}.${sss}Z`;
        const newDate = new Date(iso);
        return newDate;
    }

    /**
     * Receives two dates and calculate the difference in milliseconds
     * @param  {Date} date1 First date
     * @param  {Date} date2 Second date
     * @return {Number}      Returns the difference (date2 - date1) in milliseconds
     */
    static getDifeferenceInMilliseconds(date1, date2): number {
        const diff = Math.abs(date2 - date1);
        const milliseconds = Math.floor(diff);
        return milliseconds;
    }
    /**
     * Receives one date and returns the date part yyyy-MM-dd
     * @param  {Date} isoDateString First date
     * @return {Number}      Returns the date part of an ISO Date
     */
    static getDateFromISOString(isoDateString: Date) {
        return isoDateString.toISOString().split('T')[0];
    }

    /**
     * Receives one date and returns a string with the format dd-MM-yyyy
     * @param {Date} date The date to converts to
     * @return {string} Returns a string dd-MM-yyy
     */
    static formatToDayMonthAndYear(date: Date): string {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const strDate = `${day.toString().padStart(2,'0')}/${month.toString().padStart(2,'0')}/${year.toString()}`;
        return strDate;
    }
}