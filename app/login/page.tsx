// app/login/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    // 로그인 시도
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
       // 로그인 실패 시 회원가입 시도 (편의상 자동 가입 로직)
       const { error: signUpError } = await supabase.auth.signUp({ email, password })
       if (signUpError) alert('로그인/가입 실패: ' + signUpError.message)
       else {
         alert('회원가입 완료! 다시 로그인 버튼을 눌러주세요.')
       }
    } else {
      router.push('/') // 로그인 성공 시 홈으로 이동
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">소그룹 로그인</h1>
        <input
          type="email"
          placeholder="아이디 (이메일)"
          className="w-full p-3 mb-3 border rounded border-gray-300 text-gray-900" // 텍스트 색상 명시
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호 (6자리 이상)"
          className="w-full p-3 mb-6 border rounded border-gray-300 text-gray-900" // 텍스트 색상 명시
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
        >
          로그인 / 회원가입
        </button>
      </div>
    </div>
  )
}