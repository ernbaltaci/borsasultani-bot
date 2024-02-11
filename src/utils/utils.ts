const getDate = (hourstring: any) => {
  let date = new Date();

  const hour = hourstring.split(":");
  date.setHours(hour[0]);
  date.setMinutes(hour[1]);

  if (date.getTime() < Date.now()) {
    date.setDate(new Date().getDate() - 1);
  }
  return date.toLocaleString();
};

export { getDate };
