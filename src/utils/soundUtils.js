import { Howl } from 'howler';

export async function loadStudySounds() {
  // Lấy tất cả các file trong thư mục public/sounds/study
  const soundModules = import.meta.glob('/public/sounds/study/*.{mp3,wav,ogg}', { eager: false });

  const sounds = [];
  
  for (const path in soundModules) {
    try {
      // Nếu dùng lazy load (eager: false), phải await để tải file
      const module = await soundModules[path]();
      const filePath = path.replace('/public', ''); // Bỏ '/public' để lấy đường dẫn đúng
      sounds.push(new Howl({ src: [filePath] }));
    } catch (error) {
      console.error(`Failed to load sound: ${path}`, error);
    }
  }
  console.log(sounds);
  return sounds;
}