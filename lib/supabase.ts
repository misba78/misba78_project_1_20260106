// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 터미널에 현재 상태를 출력합니다
console.log('--- 환경변수 확인 ---')
console.log('URL:', supabaseUrl)
console.log('KEY:', supabaseKey ? '키 있음' : '키 없음')
console.log('-------------------')

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL 또는 Key가 .env.local 파일에 없습니다!')
}

export const supabase = createClient(supabaseUrl, supabaseKey)