declare module 'solc' {
  interface CompilerInput {
    language: string;
    sources: {
      [key: string]: {
        content: string;
      };
    };
    settings: {
      outputSelection: {
        [key: string]: {
          [key: string]: string[];
        };
      };
    };
  }

  interface CompilerOutput {
    contracts: {
      [key: string]: {
        [key: string]: {
          abi: any[];
          evm: {
            bytecode: {
              object: string;
            };
          };
        };
      };
    };
  }

  function compile(input: string): string;
  export = compile;
} 