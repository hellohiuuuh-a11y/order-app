import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  // 여기에 base 옵션을 추가합니다:
  base: '/order-app/', // 실제 깃허브 저장소 이름으로 변경
  plugins: [react()],
});

