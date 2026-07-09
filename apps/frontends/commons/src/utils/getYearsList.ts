const getYearsList = (): number[] => {
  const max = new Date().getFullYear();
  const min = 1950;
  const years: number[] = [];
  for (let i = max; i >= min; i--) {
    years.push(i);
  }
  return years;
};

export default getYearsList;
