'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Comment = {
  id: number
  user_email: string
  content: string
  created_at: string
  updated_at: string
}

export default function PostCard({ post, user, onRefresh }: { post: any, user: any, onRefresh: () => void }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  
  // ★ 중복 방지용 상태 추가 (전송 중일 때 true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    thanks: post.content_thanks,
    word: post.content_word,
    prayer: post.content_prayer
  })

  // 댓글 수정 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentText, setEditCommentText] = useState('')

  const getWeekInfo = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const week = Math.ceil(day / 7)
    return `${month}월 ${week}주차`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}. ${date.getDate()}. ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const getEditedLabel = (createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt).getTime()
    const updated = new Date(updatedAt).getTime()
    if (updated - created > 60000) {
      return <span className="text-[10px] text-gray-400 ml-1">(수정됨: {formatDateTime(updatedAt)})</span>
    }
    return null
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  useEffect(() => {
    fetchComments()
  }, [])

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!confirm('정말 이 나눔 글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) alert('삭제 실패: 본인 글만 삭제할 수 있습니다.')
    else {
      alert('삭제되었습니다.')
      onRefresh()
    }
  }

  // 게시글 수정
  const handleUpdatePost = async () => {
    const { error } = await supabase.from('posts').update({
      content_thanks: editData.thanks,
      content_word: editData.word,
      content_prayer: editData.prayer
    }).eq('id', post.id)

    if (error) alert('수정 실패')
    else {
      setIsEditing(false)
      alert('수정되었습니다.')
      onRefresh()
    }
  }

  // ★ 댓글 등록 (중복 방지 적용)
  const handleAddComment = async () => {
    if (!newComment.trim()) return
    if (!user) return alert('로그인이 필요합니다.')
    
    // 이미 전송 중이면 함수 종료 (따닥 방지)
    if (isSubmitting) return

    setIsSubmitting(true) // 잠금 시작 🔒

    try {
      const { error } = await supabase.from('comments').insert({
        post_id: post.id,
        user_email: user.email,
        content: newComment
      })

      if (error) alert('댓글 등록 실패')
      else {
        setNewComment('')
        fetchComments()
        setShowComments(true)
      }
    } finally {
      setIsSubmitting(false) // 잠금 해제 🔓
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) alert('삭제 실패')
    else fetchComments()
  }

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditCommentText(comment.content)
  }

  const handleUpdateComment = async (commentId: number) => {
    const { error } = await supabase.from('comments').update({
      content: editCommentText
    }).eq('id', commentId)
    
    if (error) alert('수정 실패')
    else {
      setEditingCommentId(null)
      fetchComments()
    }
  }

  const isMyPost = user?.email === post.user_email

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-4 w-full">
      <div className="flex justify-between items-start mb-4 border-b pb-3 border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
            {post.user_email ? post.user_email[0].toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">
              {post.user_email ? post.user_email.split('@')[0] : '익명'}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleString()}
              {getEditedLabel(post.created_at, post.updated_at)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 mb-1">
            No.{post.id}
          </div>
          <div className="text-xs font-bold text-blue-600">
            {getWeekInfo(post.created_at)}
          </div>
          {isMyPost && !isEditing && (
            <div className="mt-2 text-xs space-x-2">
              <button onClick={() => setIsEditing(true)} className="text-gray-500 underline hover:text-blue-600">수정</button>
              <button onClick={handleDeletePost} className="text-gray-500 underline hover:text-red-600">삭제</button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 text-sm mb-6">
        {isEditing ? (
          <div className="space-y-3">
             <div>
               <label className="text-xs font-bold text-yellow-700">감사 수정</label>
               <textarea className="w-full border p-2 rounded mt-1 text-gray-900" value={editData.thanks} onChange={(e) => setEditData({...editData, thanks: e.target.value})} />
             </div>
             <div>
               <label className="text-xs font-bold text-blue-700">말씀 수정</label>
               <textarea className="w-full border p-2 rounded mt-1 text-gray-900" value={editData.word} onChange={(e) => setEditData({...editData, word: e.target.value})} />
             </div>
             <div>
               <label className="text-xs font-bold text-purple-700">기도 수정</label>
               <textarea className="w-full border p-2 rounded mt-1 text-gray-900" value={editData.prayer} onChange={(e) => setEditData({...editData, prayer: e.target.value})} />
             </div>
             <div className="flex gap-2 justify-end">
               <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 rounded text-xs text-black">취소</button>
               <button onClick={handleUpdatePost} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold">저장 완료</button>
             </div>
          </div>
        ) : (
          <>
            <div className="w-full"><span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold mb-1">감사</span><p className="text-gray-800 whitespace-pre-wrap w-full leading-relaxed break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{post.content_thanks}</p></div>
            <div className="w-full"><span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold mb-1">말씀</span><p className="text-gray-800 whitespace-pre-wrap w-full leading-relaxed break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{post.content_word}</p></div>
            <div className="w-full"><span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold mb-1">기도</span><p className="text-gray-800 whitespace-pre-wrap w-full leading-relaxed break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{post.content_prayer}</p></div>
          </>
        )}
      </div>

      <div className="border-t pt-3 w-full">
        <button onClick={() => setShowComments(!showComments)} className="text-xs font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1">
          💬 댓글 {comments.length}개 {showComments ? '접기' : '보기'}
        </button>
        {showComments && (
          <div className="mt-3 space-y-3 bg-gray-50 p-3 rounded-lg w-full">
            {comments.map((comment) => (
              <div key={comment.id} className="w-full">
                {editingCommentId === comment.id ? (
                  <div className="flex gap-2 items-center">
                    <input className="flex-1 border rounded p-1 text-xs text-black" value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} />
                    <button onClick={() => handleUpdateComment(comment.id)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded">저장</button>
                    <button onClick={() => setEditingCommentId(null)} className="text-xs bg-gray-300 px-2 py-1 rounded text-black">취소</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-2 text-sm w-full">
                    <div className="flex-1 break-all">
                      <span className="font-bold text-blue-800 mr-2">{comment.user_email.split('@')[0]}:</span>
                      <span className="text-gray-700 w-full break-all" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{comment.content}</span>
                      <span className="text-[10px] text-gray-400 ml-2">{formatDateTime(comment.created_at)}{getEditedLabel(comment.created_at, comment.updated_at)}</span>
                    </div>
                    {user?.email === comment.user_email && (
                      <div className="flex gap-1 min-w-fit">
                         <button onClick={() => startEditComment(comment)} className="text-[10px] text-gray-400 hover:text-blue-600">수정</button>
                         <button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] text-gray-400 hover:text-red-600">삭제</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {comments.length === 0 && <p className="text-xs text-gray-400">첫 번째 댓글을 남겨보세요!</p>}
            
            <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200 w-full">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder={user ? "서로 격려의 말을 남겨주세요." : "로그인이 필요합니다."}
                // ★ 전송 중이면 입력창도 비활성화
                disabled={!user || isSubmitting}
                className="flex-1 text-xs p-2 border rounded text-gray-900 min-w-0 disabled:bg-gray-100"
              />
              <button 
                onClick={handleAddComment}
                // ★ 전송 중이면 버튼 비활성화 (클릭 불가)
                disabled={!user || isSubmitting}
                className={`text-xs px-3 py-2 rounded font-bold text-white transition-colors ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSubmitting ? '...' : '등록'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}