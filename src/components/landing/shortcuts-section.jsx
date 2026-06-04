import { useState, useEffect } from "react";
import { supabase } from "../../supabase-client";

export function ShortcutsSection() {
  const [shortcuts, setShortcuts] = useState([]);

  useEffect(() => {
    fetchShortcuts();
  }, []);

  async function fetchShortcuts() {
    const { data } = await supabase
      .from("repository_shortcuts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setShortcuts(data);
  }

  return (
    <section className="shortcuts-section">
      <h2 className="section-title">SHORTCUT</h2>
      <div className="shortcuts-gallery">
        {shortcuts.length === 0 ? (
          <p className="empty-msg">등록된 바로가기가 없습니다.</p>
        ) : (
          shortcuts.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shortcut-card"
            >
              <div className="shortcut-image-wrap">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} />
                ) : (
                  <div className="shortcut-no-image">
                    <span>{item.title?.charAt(0)?.toUpperCase() || "?"}</span>
                  </div>
                )}
              </div>
              <div className="shortcut-info">
                <span className="shortcut-title">{item.title}</span>
                {item.description && (
                  <span className="shortcut-desc">{item.description}</span>
                )}
              </div>
            </a>
          ))
        )}
      </div>
    </section>
  );
}
