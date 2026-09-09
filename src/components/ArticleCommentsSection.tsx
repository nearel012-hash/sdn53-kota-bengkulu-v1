import { useState, useEffect, FormEvent } from 'react';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Pin,
  Trash2,
  Reply,
  ShieldCheck,
  User,
  Heart,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ArticleComment, CommentAuthorRole, AdminUser, SchoolIdentity } from '../types';
import {
  getCommentsByArticleId,
  addArticleComment,
  likeArticleComment,
  deleteArticleComment,
  togglePinComment
} from '../services/storage';

interface ArticleCommentsSectionProps {
  articleId: string;
  articleTitle: string;
  schoolIdentity: SchoolIdentity;
  adminUser?: AdminUser | null;
  onCommentCountChange?: (count: number) => void;
}

const ROLE_OPTIONS: { role: CommentAuthorRole; label: string; color: string }[] = [
  { role: 'Siswa', label: 'Siswa', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { role: 'Orang Tua / Wali', label: 'Orang Tua / Wali', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { role: 'Alumni', label: 'Alumni', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { role: 'Guru / Tendik', label: 'Guru / Tendik', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { role: 'Masyarakat Umum', label: 'Masyarakat Umum', color: 'bg-slate-100 text-slate-800 border-slate-200' }
];

const QUICK_REACTIONS = [
  '👍 Sangat Bermanfaat',
  '🎓 Sukses Selalu',
  '👏 Selamat & Bangga!',
  '✨ Mantap & Menginspirasi',
  '🙏 Terima Kasih Infonya'
];

export default function ArticleCommentsSection({
  articleId,
  articleTitle,
  schoolIdentity,
  adminUser,
  onCommentCountChange
}: ArticleCommentsSectionProps) {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  // New Comment Form States
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState<CommentAuthorRole>('Masyarakat Umum');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Simple Math Anti-Spam Challenge
  const [mathNum1, setMathNum1] = useState(3);
  const [mathNum2, setMathNum2] = useState(4);
  const [userMathAnswer, setUserMathAnswer] = useState('');

  // Replying state
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyAuthorName, setReplyAuthorName] = useState('');
  const [replyAuthorRole, setReplyAuthorRole] = useState<CommentAuthorRole>('Masyarakat Umum');
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Local liked comment IDs
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());

  // Generate new math challenge
  const generateNewMath = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 7) + 1;
    setMathNum1(n1);
    setMathNum2(n2);
    setUserMathAnswer('');
  };

  // Load comments
  const fetchComments = async () => {
    try {
      const data = await getCommentsByArticleId(articleId);
      setComments(data);
      if (onCommentCountChange) {
        onCommentCountChange(data.length);
      }
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchComments();
    generateNewMath();

    // Auto set admin role if logged in
    if (adminUser?.isAuthenticated) {
      setAuthorName(adminUser.name || 'Admin Sekolah');
      setAuthorRole('Admin / Redaksi Sekolah');
    }
  }, [articleId, adminUser?.isAuthenticated]);

  // Handle submit main comment
  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!authorName.trim()) {
      setFeedbackMessage({ text: 'Mohon isi nama lengkap atau nama panggilan Anda.', type: 'error' });
      return;
    }
    if (!content.trim() || content.trim().length < 5) {
      setFeedbackMessage({ text: 'Komentar terlalu pendek (minimal 5 karakter).', type: 'error' });
      return;
    }

    // Verify math answer
    const expected = mathNum1 + mathNum2;
    if (parseInt(userMathAnswer.trim(), 10) !== expected) {
      setFeedbackMessage({
        text: `Jawaban verifikasi keamanan salah (${mathNum1} + ${mathNum2} = ?). Silakan coba lagi.`,
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addArticleComment({
        articleId,
        authorName: authorName.trim(),
        authorRole: adminUser?.isAuthenticated && authorRole === 'Admin / Redaksi Sekolah' ? 'Admin / Redaksi Sekolah' : authorRole,
        authorEmail: authorEmail.trim() || undefined,
        content: content.trim()
      });

      // Clear input and regenerate challenge
      setContent('');
      if (!adminUser?.isAuthenticated) {
        setUserMathAnswer('');
      }
      generateNewMath();

      setFeedbackMessage({
        text: 'Terima kasih! Komentar Anda telah berhasil dikirim dan dipublikasikan.',
        type: 'success'
      });
      setTimeout(() => setFeedbackMessage(null), 5000);

      await fetchComments();
    } catch (err) {
      console.error('Failed to post comment', err);
      setFeedbackMessage({ text: 'Gagal mengirim komentar. Silakan coba beberapa saat lagi.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submit reply
  const handleSubmitReply = async (parentId: string, e: FormEvent) => {
    e.preventDefault();
    if (!replyAuthorName.trim()) return;
    if (!replyContent.trim() || replyContent.trim().length < 3) return;

    setIsSubmittingReply(true);
    try {
      await addArticleComment({
        articleId,
        authorName: replyAuthorName.trim(),
        authorRole: adminUser?.isAuthenticated && replyAuthorRole === 'Admin / Redaksi Sekolah' ? 'Admin / Redaksi Sekolah' : replyAuthorRole,
        content: replyContent.trim(),
        parentId
      });

      setReplyContent('');
      setReplyTargetId(null);
      await fetchComments();
    } catch (err) {
      console.error('Failed to reply', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handle like
  const handleLike = async (commentId: string) => {
    if (likedCommentIds.has(commentId)) return; // already liked in current session

    setLikedCommentIds((prev) => new Set(prev).add(commentId));
    try {
      const newCount = await likeArticleComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: newCount } : c))
      );
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  // Handle pin/unpin (Admin)
  const handleTogglePin = async (commentId: string) => {
    try {
      const newPin = await togglePinComment(commentId);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, isPinned: newPin } : c))
      );
    } catch (err) {
      console.error('Failed to toggle pin', err);
    }
  };

  // Handle delete (Admin)
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Hapus komentar ini beserta tanggapannya?')) return;
    try {
      await deleteArticleComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  // Separate top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parentId);
  const repliesMap: Record<string, ArticleComment[]> = {};
  comments.forEach((c) => {
    if (c.parentId) {
      if (!repliesMap[c.parentId]) {
        repliesMap[c.parentId] = [];
      }
      repliesMap[c.parentId].push(c);
    }
  });

  // Sort top-level comments
  const sortedTopComments = [...topLevelComments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (sortBy === 'popular') {
      return (b.likes || 0) - (a.likes || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getRoleBadge = (role: CommentAuthorRole) => {
    if (role === 'Admin / Redaksi Sekolah') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-700 text-white shadow-xs">
          <ShieldCheck className="w-3 h-3" />
          <span>Resmi Sekolah</span>
        </span>
      );
    }
    const matched = ROLE_OPTIONS.find((r) => r.role === role);
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
          matched?.color || 'bg-slate-100 text-slate-700 border-slate-200'
        }`}
      >
        <span>{role}</span>
      </span>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const getAvatarGradient = (role: CommentAuthorRole) => {
    switch (role) {
      case 'Admin / Redaksi Sekolah':
        return 'bg-gradient-to-tr from-blue-700 to-indigo-900 text-white';
      case 'Guru / Tendik':
        return 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white';
      case 'Orang Tua / Wali':
        return 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white';
      case 'Alumni':
        return 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white';
      case 'Siswa':
        return 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white';
      default:
        return 'bg-gradient-to-tr from-slate-600 to-slate-800 text-white';
    }
  };

  return (
    <section id="article-comments-section" className="mt-12 pt-8 border-t border-slate-200/90 space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Kolom Komentar & Diskusi Publik
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sampaikan tanggapan, pertanyaan, atau ucapan secara santun untuk artikel ini.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-xs">
            {comments.length} Komentar
          </span>

          {topLevelComments.length > 1 && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSortBy('newest')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  sortBy === 'newest' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Terbaru
              </button>
              <button
                type="button"
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  sortBy === 'popular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Terpopuler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Comment Submission Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900">Tinggalkan Komentar atau Pertanyaan</h4>
          </div>
          {adminUser?.isAuthenticated && (
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Login sebagai Admin / Redaksi</span>
            </span>
          )}
        </div>

        {feedbackMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 transition-all ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmitComment} className="space-y-4">
          {/* Top Row: Name, Role, Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap / Panggilan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Contoh: Budi Santoso / Alumni 2023"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Role / Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status / Hubungan dengan Sekolah <span className="text-rose-500">*</span>
              </label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value as CommentAuthorRole)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {adminUser?.isAuthenticated && (
                  <option value="Admin / Redaksi Sekolah">⭐ Admin / Redaksi Sekolah</option>
                )}
                <option value="Siswa">Siswa</option>
                <option value="Orang Tua / Wali">Orang Tua / Wali Murid</option>
                <option value="Alumni">Alumni</option>
                <option value="Guru / Tendik">Guru / Tenaga Pendidik</option>
                <option value="Masyarakat Umum">Masyarakat Umum</option>
              </select>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email / Kontak <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="nama@email.com (tidak dipublikasikan)"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick Reaction Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Tanggapan Cepat:</span>
            {QUICK_REACTIONS.map((react, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setContent((prev) => (prev ? `${prev} ${react}` : react));
                }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors"
              >
                {react}
              </button>
            ))}
          </div>

          {/* Comment Textarea */}
          <div>
            <textarea
              required
              rows={3}
              maxLength={800}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan komentar, masukan, pertanyaan, atau apresiasi Anda di sini secara santun..."
              className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Gunakan bahasa yang sopan dan santun.</span>
              <span>{content.length}/800 karakter</span>
            </div>
          </div>

          {/* Bottom Bar: Human Verification & Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
            {/* Anti-Spam Math Check */}
            <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Verifikasi Anti-Spam:</span>
              <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                {mathNum1} + {mathNum2} = ?
              </span>
              <input
                type="number"
                required
                value={userMathAnswer}
                onChange={(e) => setUserMathAnswer(e.target.value)}
                placeholder="Jawaban"
                className="w-16 px-2 py-1 text-xs text-center font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: schoolIdentity.theme.accentColor }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim Komentar...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Komentar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comment List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Memuat komentar pembaca...</p>
          </div>
        ) : sortedTopComments.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Belum ada komentar untuk artikel ini</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Jadilah yang pertama memberikan tanggapan, pertanyaan, atau ucapan apresiasi melalui formulir di atas.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTopComments.map((comment) => {
              const replies = repliesMap[comment.id] || [];
              const isLiked = likedCommentIds.has(comment.id);

              return (
                <div
                  key={comment.id}
                  className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                    comment.isPinned
                      ? 'border-amber-300 shadow-sm bg-gradient-to-b from-amber-50/20 to-white'
                      : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {/* Pinned Ribbon if Pinned */}
                  {comment.isPinned && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-xl mb-4 w-fit border border-amber-200 shadow-2xs">
                      <Pin className="w-3.5 h-3.5 text-amber-700" />
                      <span>Komentar Disematkan oleh Pengelola Sekolah</span>
                    </div>
                  )}

                  {/* Comment Author Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-xs shrink-0 ${getAvatarGradient(
                          comment.authorRole
                        )}`}
                      >
                        {getInitials(comment.authorName)}
                      </div>

                      {/* Name & Role */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{comment.authorName}</span>
                          {getRoleBadge(comment.authorRole)}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {comment.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* Admin Moderation Controls */}
                    {adminUser?.isAuthenticated && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(comment.id)}
                          title={comment.isPinned ? 'Lepas Sematan' : 'Sematkan Komentar'}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            comment.isPinned
                              ? 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                              : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          title="Hapus Komentar"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Body */}
                  <div className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-0 sm:pl-13 font-normal">
                    {comment.content}
                  </div>

                  {/* Comment Actions (Like & Reply) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-3 pl-0 sm:pl-13 text-xs">
                    <button
                      type="button"
                      onClick={() => handleLike(comment.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        isLiked
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{comment.likes || 0}</span>
                      <span className="hidden sm:inline">Suka</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (replyTargetId === comment.id) {
                          setReplyTargetId(null);
                        } else {
                          setReplyTargetId(comment.id);
                          if (adminUser?.isAuthenticated) {
                            setReplyAuthorName(adminUser.name || 'Admin Sekolah');
                            setReplyAuthorRole('Admin / Redaksi Sekolah');
                          }
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80 transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Balas</span>
                      {replies.length > 0 && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
                          {replies.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Inline Reply Form when Active */}
                  {replyTargetId === comment.id && (
                    <form
                      onSubmit={(e) => handleSubmitReply(comment.id, e)}
                      className="mt-4 pl-0 sm:pl-13 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 animate-fade-in"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Membalas tanggapan {comment.authorName}:</span>
                        <button
                          type="button"
                          onClick={() => setReplyTargetId(null)}
                          className="text-slate-400 hover:text-slate-600 font-normal"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          value={replyAuthorName}
                          onChange={(e) => setReplyAuthorName(e.target.value)}
                          placeholder="Nama Lengkap Anda"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                        />
                        <select
                          value={replyAuthorRole}
                          onChange={(e) => setReplyAuthorRole(e.target.value as CommentAuthorRole)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {adminUser?.isAuthenticated && (
                            <option value="Admin / Redaksi Sekolah">⭐ Admin / Redaksi Sekolah</option>
                          )}
                          <option value="Siswa">Siswa</option>
                          <option value="Orang Tua / Wali">Orang Tua / Wali Murid</option>
                          <option value="Alumni">Alumni</option>
                          <option value="Guru / Tendik">Guru / Tenaga Pendidik</option>
                          <option value="Masyarakat Umum">Masyarakat Umum</option>
                        </select>
                      </div>

                      <textarea
                        required
                        rows={2}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Tuliskan tanggapan balasan Anda..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmittingReply}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          {isSubmittingReply ? (
                            <span>Mengirim...</span>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim Balasan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested Replies List */}
                  {replies.length > 0 && (
                    <div className="mt-4 pl-0 sm:pl-10 space-y-3 pt-3 border-t border-slate-100">
                      {replies.map((reply) => {
                        const isReplyLiked = likedCommentIds.has(reply.id);

                        return (
                          <div
                            key={reply.id}
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                              reply.authorRole === 'Admin / Redaksi Sekolah'
                                ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                                : 'bg-slate-50/80 border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarGradient(
                                    reply.authorRole
                                  )}`}
                                >
                                  {getInitials(reply.authorName)}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900">{reply.authorName}</span>
                                    {getRoleBadge(reply.authorRole)}
                                  </div>
                                  <span className="text-[10px] text-slate-400">{reply.createdAt}</span>
                                </div>
                              </div>

                              {adminUser?.isAuthenticated && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(reply.id)}
                                  title="Hapus Tanggapan"
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="mt-2 text-xs text-slate-700 leading-relaxed pl-9">
                              {reply.content}
                            </div>

                            <div className="mt-2.5 pl-9 flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => handleLike(reply.id)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                  isReplyLiked
                                    ? 'bg-rose-100/80 text-rose-700 font-bold'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                                }`}
                              >
                                <ThumbsUp className={`w-3 h-3 ${isReplyLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                                <span>{reply.likes || 0}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
