const path = "http://127.0.0.1:4523/mock/772752/cabinet/";
function getCabinateByName(name: string) {
  return fetch(path + name).then((res) => res.json());
}
export { getCabinateByName };
