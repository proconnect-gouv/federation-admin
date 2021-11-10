export default function getRandomInt(max, min = 0) {
  const minus = Math.ceil(min);
  const maxus = Math.floor(max);
  return Math.floor(Math.random() * (maxus - minus + 1)) + minus;
}
