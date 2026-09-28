export const formatDate = (date: string, includeTime: boolean = false) => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
};
