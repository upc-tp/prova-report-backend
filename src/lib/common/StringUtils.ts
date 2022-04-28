export class StringUtils {

    static format(...params: string[]): string {
      const value = params[0];
      let args = Array.prototype.slice.call(params, 1);
      return value.replace(/{(\d+)}/g, (match, number) => { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    }

    static add_time(field: string): string {
      return field+"_"+Date.now().toString().slice(5,13);
    };

    static csvRowToArray(row: string, delimiter: string = ',', quoteChar: string = '"') {
      let nStart = 0, nEnd = 0, a=[], nRowLen=row.length, bQuotedValue;
      while (nStart <= nRowLen) {
          bQuotedValue = (row.charAt(nStart) === quoteChar);
          if (bQuotedValue) {
              nStart++;
              nEnd = row.indexOf(quoteChar + delimiter, nStart)
          } else {
              nEnd = row.indexOf(delimiter, nStart)
          }
          if (nEnd < 0) nEnd = nRowLen;
          a.push(row.substring(nStart,nEnd));
          nStart = nEnd + delimiter.length + (bQuotedValue ? 1 : 0)
      }
      return a;
  }

}