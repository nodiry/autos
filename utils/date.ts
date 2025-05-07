// utils/date.ts
export const getDefaultDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(); // Start of last month
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime(); // End of current month
  return { start, end };
};

export const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  // Treat Monday as start of the week
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};
