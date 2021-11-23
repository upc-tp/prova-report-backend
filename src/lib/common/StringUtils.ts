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

}