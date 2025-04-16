export const TECHNIQUES = {
  DEFAULT: {
    id: 'DEFAULT',
    name: '4-7-8 (Mặc định)',
    steps: [
      { action: 'Hít vào', duration: 4, sound: 'breatheIn' },
      { action: 'Giữ hơi', duration: 7, sound: 'hold' },
      { action: 'Thở ra', duration: 8, sound: 'breatheOut' },
    ],
    desc: 'Kỹ thuật 4-7-8',
    benefit: 'Giúp thư giãn nhanh, giảm lo âu, dễ đi vào giấc ngủ',
    difficulty: '⭐⭐☆ (Trung bình)',
    audience: 'Người mất ngủ, căng thẳng',
  },
  BOX: {
    id: 'BOX',
    name: 'Thở hộp (Box Breathing)',
    steps: [
      { action: 'Hít vào', duration: 4, sound: 'breatheIn' },
      { action: 'Giữ hơi', duration: 4, sound: 'hold' },
      { action: 'Thở ra', duration: 4, sound: 'breatheOut' },
      { action: 'Giữ hơi', duration: 4, sound: 'hold' },
    ],
    desc: 'Kỹ thuật Thở hộp',
    benefit: 'Ổn định nhịp tim, giảm stress cấp tốc',
    difficulty: '⭐⭐ (Dễ nhớ)',
    audience: 'Dân văn phòng, lập trình viên chạy deadline',
  },
  EQUAL: {
    id: 'EQUAL',
    name: 'Thở 4-4-4 (Equal Breathing)',
    steps: [
      { action: 'Hít vào', duration: 4, sound: 'breatheIn' },
      { action: 'Thở ra', duration: 4, sound: 'breatheOut' },
    ],
    desc: 'Kỹ thuật Thở đều',
    benefit: 'Nhịp điệu đều đặn giúp tập trung, không gây chóng mặt',
    difficulty: '⭐ (Rất dễ)',
    audience: 'Người mới bắt đầu',
  },
};