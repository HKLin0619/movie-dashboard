declare module 'opencc-js' {
  export interface ConverterOptions {
    from: string;
    to: string;
  }

  export interface OpenCCStatic {
    Converter(options: ConverterOptions): (text: string) => string;
  }

  const OpenCC: OpenCCStatic;
  export default OpenCC;
}
