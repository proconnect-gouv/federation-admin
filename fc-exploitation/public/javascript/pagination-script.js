export function pagination(currentPage, totalPagesFromView) {
  const current = parseInt(currentPage, 10);
  const last = parseInt(totalPagesFromView, 10);
  const delta = 2;
  const left = current - delta;
  const right = current + delta + 1;
  const range = [];
  const rangeWithDots = [];
  let length;


  for (let i = 1; i <= last; i++) {
    if (i == 1 || i == last || i >= left && i < right) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (length) {
      if (i - length === 2) {
        rangeWithDots.push(length + 1);
      } else if (i - length !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    length = i;
  }
  return rangeWithDots;
}
