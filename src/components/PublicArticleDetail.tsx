import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  Paperclip,
  Download,
  Share2,
  FileText,
  Music,
  Video,
  Archive,
  Image as ImageIcon,
  Check,
  ExternalLink,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { NewsArticle, MediaItem, SchoolIdentity, AdminUser } from '../types';
import { getMediaById, incrementArticleViews, getAllArticles, getAllMedia } from '../services/storage';
import { formatFileSize, canBrowserPreviewDirectly } from '../utils/fileValidation';
import MediaPreviewModal from './MediaPreviewModal';
import InlineVideoPlayer from './InlineVideoPlayer';
import InlineAudioPlayer from './InlineAudioPlayer';
import ArticleCommentsSection from './ArticleCommentsSection';

interface PublicArticleDetailProps {
  article: NewsArticle;
  schoolIdentity: SchoolIdentity;
  adminUser?: AdminUser | null;
  onBack: () => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export default function PublicArticleDetail({
  article,
  schoolIdentity,
  adminUser,
  onBack,
  onSelectArticle
}: PublicArticleDetailProps) {
  const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [previewMediaItem, setPreviewMediaItem] = useState<MediaItem | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    // Increment view counter
    incrementArticleViews(article.id);

    // Fetch attached media items
    const loadAttachmentsAndRelated = async () => {
      try {
        const [allMedia, allArts] = await Promise.all([getAllMedia(), getAllArticles()]);
        
        // Attached media
        if (article.attachedMediaIds && article.attachedMediaIds.length > 0) {
          const matched = allMedia.filter((m) => article.attachedMediaIds.includes(m.id));
          setAttachedMedia(matched);
        } else {
          setAttachedMedia([]);
        }

        // Related articles (published, excluding current)
        const related = allArts
          .filter((a) => a.id !== article.id && a.status === 'published')
          .slice(0, 3);
        setRelatedArticles(related);
      } catch (err) {
        console.error('Failed to load article attachments', err);
      }
    };

    loadAttachmentsAndRelated();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    });
  };

  // Find any attached audio or video for inline playback
  const audioAttachments = attachedMedia.filter((m) => m.type === 'audio');
  const videoAttachments = attachedMedia.filter((m) => m.type === 'video');
  const documentAttachments = attachedMedia.filter(
    (m) => m.type === 'document' || m.type === 'archive' || m.type === 'other'
  );
  const imageAttachments = attachedMedia.filter((m) => m.type === 'image');

  return (
    <div id="public-article-detail-view" className="py-10 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumbs & Back button */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Warta Sekolah</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tautan Disalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Bagikan Artikel</span>
              </>
            )}
          </button>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Article Header */}
          <div className="p-6 sm:p-10 border-b border-slate-100 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-xs"
                style={{ backgroundColor: schoolIdentity.theme.accentColor }}
              >
                {article.category}
              </span>
              {article.status === 'draft' && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  DRAF INTERNAL
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <User className="w-4 h-4 text-blue-600" />
                <span>Oleh: {article.author}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{article.publishedAt || article.createdAt}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{article.views + 1} Kali Dibaca</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>{commentCount} Komentar</span>
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {article.featuredImageUrl && (
            <div className="w-full bg-slate-900/5 max-h-[500px] overflow-hidden flex items-center justify-center border-b border-slate-100">
              <img
                src={article.featuredImageUrl}
                alt={article.title}
                className="w-full h-full object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* Inline Media Players if Audio or Video attached */}
          {(audioAttachments.length > 0 || videoAttachments.length > 0) && (
            <div className="p-6 sm:p-8 bg-blue-50/50 border-b border-blue-100 space-y-4">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span>Media Tersemat dalam Berita</span>
              </h3>

              {/* Video Player - Can be played directly with 1 click */}
              {videoAttachments.map((vid) => (
                <div key={vid.id} className="space-y-2">
                  <InlineVideoPlayer item={vid} autoPlay={false} showDetails={true} />
                </div>
              ))}

              {/* Audio Player - Can be played directly */}
              {audioAttachments.map((aud) => (
                <InlineAudioPlayer key={aud.id} item={aud} />
              ))}
            </div>
          )}

          {/* Article Story Content */}
          <div className="p-6 sm:p-10 space-y-4">
            {article.excerpt && (
              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed border-l-4 border-blue-600 pl-4 italic bg-slate-50/70 py-2.5 rounded-r-xl">
                {article.excerpt}
              </p>
            )}

            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 font-normal">
              {article.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={index}
                      className="text-base sm:text-lg font-bold text-slate-900 pt-3 pb-1 border-b border-slate-100"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={index}
                      className="border-l-4 border-amber-500 bg-amber-50/40 p-4 rounded-r-xl italic text-slate-800"
                    >
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                return (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Downloadable Document Attachments Section */}
          {documentAttachments.length > 0 && (
            <div className="p-6 sm:p-10 bg-slate-50/80 border-t border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span>Dokumen Resmi & Berkas Terlampir</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Silakan tinjau langsung atau unduh dokumen pendaftaran / panduan berikut.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {documentAttachments.length} Dokumen
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {documentAttachments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        {doc.type === 'archive' ? (
                          <Archive className="w-5 h-5 text-orange-600" />
                        ) : doc.extension === 'pdf' ? (
                          <FileText className="w-5 h-5 text-rose-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5
                          className="text-xs font-bold text-slate-900 truncate"
                          title={doc.originalName}
                        >
                          {doc.originalName}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Format: <span className="uppercase font-mono">.{doc.extension}</span> • {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setPreviewMediaItem(doc)}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => setPreviewMediaItem(doc)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh File</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Public Discussion & Comments Section */}
        <ArticleCommentsSection
          articleId={article.id}
          articleTitle={article.title}
          schoolIdentity={schoolIdentity}
          adminUser={adminUser}
          onCommentCountChange={(count) => setCommentCount(count)}
        />

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Publikasi Sekolah Terkait</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-2 line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{rel.createdAt.split(' ')[0]}</span>
                    <span className="text-blue-600 font-semibold inline-flex items-center">
                      Baca <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <MediaPreviewModal
        item={previewMediaItem}
        onClose={() => setPreviewMediaItem(null)}
      />
    </div>
  );
}
