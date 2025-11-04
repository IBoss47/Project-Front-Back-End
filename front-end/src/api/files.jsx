// src/api/files.js
// เดโม่: คืน URL blob ชั่วคราวให้เห็นผลทันที
export async function uploadImageMock(file) {
  return new Promise((res) => {
    const url = URL.createObjectURL(file);
    setTimeout(() => res(url), 500);
  });   
}
