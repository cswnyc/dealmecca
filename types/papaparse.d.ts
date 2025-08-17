declare module 'papaparse' {
  export interface ParseConfig {
    header?: boolean;
    skipEmptyLines?: boolean;
    dynamicTyping?: boolean;
    complete?: (results: any) => void;
    error?: (error: any) => void;
  }

  export interface Papa {
    parse(input: string | File, config?: ParseConfig): any;
  }

  const Papa: Papa;
  export default Papa;
}
