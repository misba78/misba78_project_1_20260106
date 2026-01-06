'use client'
import { useEffect, useState, useCallback } from 'react' // useCallback 추가
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PostCard from '@/components/PostCard'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 데이터 불러오기 함수 (재사용을 위해 분리)
  const fetchData = useCallback(async () => {
    // 로딩바는 처음에만 보여주고, 새로고침 때는 안 보여주는 게 자연스러움
    // setLoading(true) 
    
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setPosts(data || [])
    setLoading(false)
  }, [])

  // 처음 접속 시 실행
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">🙏 소그룹 나눔방</h1>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-blue-800 font-bold">{user.email?.split('@')[0]}님</span>
              <button onClick={handleLogout} className="text-xs border px-2 py-1 rounded text-gray-500">로그아웃</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-full">로그인</Link>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {loading && <p className="text-center text-gray-500 py-10">로딩 중...</p>}
        
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">아직 나눔 글이 없어요.</p>
          </div>
        )}

        {/* onRefresh 함수를 PostCard에 전달해서, 삭제/수정 후 목록을 갱신하게 함 */}
        {!loading && posts.map((post) => (
          <PostCard key={post.id} post={post} user={user} onRefresh={fetchData} />
        ))}
      </main>

      {user && (
        <Link href="/write" className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-3xl pb-1 z-50 hover:bg-blue-700 transition">
          +
        </Link>
      )}
    </div>
  )
}