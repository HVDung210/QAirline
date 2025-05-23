export const cityMapping = {
  HAN: 'Hà Nội',
  SGN: 'Hồ Chí Minh',
  DAD: 'Đà Nẵng',
  CXR: 'Nha Trang',
  PQC: 'Phú Quốc',
  UIH: 'Quy Nhơn',
  VCA: 'Cần Thơ',
  // Thêm các thành phố khác nếu cần
};

export const getCityName = (cityCode) => {
  return cityMapping[cityCode] || cityCode;
};