export default interface EmbeddingOptions {
    model: string;
    input: string | string[];
    user?: string;
    encoding_format?: 'float' | 'base64';
  }
  

