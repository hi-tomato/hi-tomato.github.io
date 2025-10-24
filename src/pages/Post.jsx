import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./Post.css";

function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const postFiles = import.meta.glob("../posts/*.md", {
          eager: true,
          as: "raw",
        });
        const postPath = `../posts/${slug}.md`;
        const content = postFiles[postPath];

        if (!content) {
          setPost(null);
          return;
        }

        // front matter 파싱
        const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)/);
        if (match) {
          const frontMatter = match[1];
          const markdown = match[2];

          const metadata = {};
          frontMatter.split("\n").forEach((line) => {
            const [key, ...values] = line.split(":");
            if (key && values.length) {
              metadata[key.trim()] = values
                .join(":")
                .trim()
                .replace(/['"]/g, "");
            }
          });

          setPost({
            title: metadata.title || "Untitled",
            date: metadata.date || "",
            tags: metadata.tags
              ? metadata.tags
                  .replace(/[\[\]]/g, "")
                  .split(",")
                  .map((t) => t.trim())
              : [],
            content: markdown,
          });
        }
      } catch (error) {
        console.error("Error loading post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (loading) return <div className="loading">로딩 중...</div>;
  if (!post)
    return <div className="not-found">포스트를 찾을 수 없습니다 😢</div>;

  return (
    <div className="post">
      <Link to="/" className="back-link">
        ← 목록으로
      </Link>

      <article>
        <header className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span className="date">{post.date}</span>
            <div className="tags">
              {post.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="post-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}

export default Post;
