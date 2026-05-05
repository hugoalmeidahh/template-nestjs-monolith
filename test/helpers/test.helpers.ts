export const AUTH = [process.env.BASIC_USER, process.env.BASIC_PASS];

export const delay = async (seconds = 2) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1000 * seconds);
  });
};

export const getAppName = () => {
  return process.env.APP_NAME
    ? `${process.env.APP_NAME.replaceAll(' ', '-').toLowerCase()}-`
    : '';
};
