export interface ResolverMap {
  [key: string]: {
    [key: string]: (parent: any, agrs: any, context: {}, info: any) => any;
  };
}
