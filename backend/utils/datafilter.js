const getDateRange = (range) => {
  const now = new Date();
  let start;

  switch (range) {
    case "daily":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "weekly": {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day;
      start = new Date(d.setDate(diff));
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "yearly":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "all":
      start = new Date(0);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1); // default monthly
  }

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export default getDateRange;