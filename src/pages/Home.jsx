import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // posts 폴더의 모든 마크다운 파일 가져오기
    const postFiles = import.meta.glob("../posts/*.md", {
      eager: true,
      as: "raw",
    });

    const loadedPosts = Object.entries(postFiles).map(([path, content]) => {
      // front matter 파싱
      const match = content.match(/^---\n([\s\S]+?)\n---/);
      const frontMatter = match ? match[1] : "";

      const metadata = {};
      frontMatter.split("\n").forEach((line) => {
        const [key, ...values] = line.split(":");
        if (key && values.length) {
          metadata[key.trim()] = values.join(":").trim().replace(/['"]/g, "");
        }
      });

      // 파일명에서 slug 추출
      const fileName = path.split("/").pop();
      const slug = fileName.replace(".md", "");

      return {
        slug,
        title: metadata.title || "Untitled",
        date: metadata.date || "",
        description: metadata.description || "",
        tags: metadata.tags
          ? metadata.tags
              .replace(/[\[\]]/g, "")
              .split(",")
              .map((t) => t.trim())
          : [],
      };
    });

    // 날짜순 정렬 (최신순)
    loadedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    setPosts(loadedPosts);
  }, []);

  return (
    <div className="home">
      <div className="hero">
        <h2>배움을 기록하는 공간 ✨</h2>
        <p>개발하면서 배운 것들을 정리합니다</p>
      </div>

      <div className="posts">
        {posts.map((post) => (
          <article key={post.slug} className="post-card">
            <Link to={`/post/${post.slug}`}>
              <h3>{post.title}</h3>
              <p className="date">{post.date}</p>
              <p className="description">{post.description}</p>
              <div className="tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Home;
