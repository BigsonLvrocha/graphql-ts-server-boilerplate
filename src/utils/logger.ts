export const logger = (...params: any[]) => {
  params.forEach(param => {
    console.log(param);
  });
};
