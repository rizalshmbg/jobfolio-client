export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-GB').format(new Date(date));
};
