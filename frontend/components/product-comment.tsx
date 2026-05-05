'use client'

import { useState, useMemo } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductComment } from '@/lib/store'

interface ProductCommentsProps {
  comments: ProductComment[]
  productRating: number
  onAddComment: (rating: number, text: string) => void
  userCanComment: boolean
}

export function ProductComments({
  comments,
  productRating,
  onAddComment,
  userCanComment,
}: ProductCommentsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newText, setNewText] = useState('')
  const COMMENTS_PER_PAGE = 5

  const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE)
  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * COMMENTS_PER_PAGE
    return comments.slice(start, start + COMMENTS_PER_PAGE)
  }, [comments, currentPage, COMMENTS_PER_PAGE])

  const handleSubmitComment = () => {
    if (newText.trim()) {
      onAddComment(newRating, newText)
      setNewText('')
      setNewRating(0)
      setShowCommentForm(false)
      setCurrentPage(Math.ceil((comments.length + 1) / COMMENTS_PER_PAGE))
    }
  }

  return (
    <div className="bg-white rounded-lg border border-border p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(productRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">{productRating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              {comments.length} {comments.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>

        {userCanComment && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="px-6 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] transition-colors font-medium"
          >
            {showCommentForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && userCanComment && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-border">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-3">Rating</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNewRating(0)}
                className={`px-3 py-1 rounded-md border text-sm ${newRating === 0 ? 'bg-muted border-primary' : 'border-border'}`}
              >
                0
              </button>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= newRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">Your Review</label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee4d2d] focus:border-transparent"
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmitComment}
            disabled={!newText.trim()}
            className="px-6 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Review
          </button>
        </div>
      )}

      {!userCanComment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-sm text-blue-800">
          👤 Sign in and purchase this product to leave a review.
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <>
          <div className="space-y-6">
            {paginatedComments.map((comment) => (
              <div key={comment.id} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{comment.userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < comment.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {comment.createdAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{comment.text}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                // Show at most 5 page numbers
                const delta = 2
                const left = Math.max(1, currentPage - delta)
                const right = Math.min(totalPages, currentPage + delta)
                if (page < left || page > right) return null

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg border font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-[#ee4d2d] text-white border-[#ee4d2d]'
                        : 'border-border hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  )
}
