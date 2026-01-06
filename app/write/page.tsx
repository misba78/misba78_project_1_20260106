'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function WritePage() {
  const [thanks, setThanks] = useState('')
  const [word, setWord] = useState('')
  const [prayer, setPrayer] = useState('')
  
  // ★ 중복 방지용 상태
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const router = useRouter()

  useEffect(() => {
    // 로그인 체크
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다.')
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [])

  const handleSubmit = async () => {
    if (!thanks && !word && !prayer) {
      alert('최소한 한 가지 내용은 입력해주세요.')
      return
    }

    // ★ 이미 전송 중이면 멈춤 (따닥 방지)
    if (isSubmitting) return

    setIsSubmitting(true) // 잠금 시작 🔒

    try {
      const { error } = await supabase.from('posts').insert({
        user_email: user.email,
        content_thanks: thanks,
        content_word: word,
        content_prayer: prayer
      })

      if (error) {
        alert('저장 실패: ' + error.message)
      } else {
        alert('저장되었습니다!')
        // 저장 후 메인으로 이동 (replace를 쓰면 뒤로가기 했을 때 글쓰기 화면 안 나옴)
        router.replace('/') 
      }
    } catch (e) {
      alert('오류가 발생했습니다.')
    } finally {
      // 페이지 이동이 일어나므로 굳이 false로 안 돌려도 되지만 안전하게 처리
      // setIsSubmitting(false) 
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">✍️ 나눔 작성하기</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-yellow-700 mb-2">오늘 감사한 일</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-yellow-500 outline-none text-gray-900"
              placeholder="사소한 것도 좋아요."
              value={thanks}
              onChange={(e) => setThanks(e.target.value)}
              disabled={isSubmitting} // 전송 중엔 입력 불가
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-blue-700 mb-2">묵상한 말씀</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              placeholder="마음에 와닿은 구절이나 생각"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-700 mb-2">기도 제목</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-purple-500 outline-none text-gray-900"
              placeholder="함께 기도할 제목을 나눠주세요"
              value={prayer}
              onChange={(e) => setPrayer(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
            disabled={isSubmitting}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting} // ★ 전송 중엔 버튼 비활성화
            className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}