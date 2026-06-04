import { useState, useEffect } from "react";
import { supabase } from "../../supabase-client";

export function ShortcutsManager() {
  const [shortcuts, setShortcuts] = useState([]);
  const [form, setForm] = useState({ title: "", url: "", description: "", image_url: "" });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

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

  async function uploadImage(file) {
    const ext = file.name.split(".").pop();
    const fileName = `shortcut_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("shortcut-images")
      .upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage
      .from("shortcut-images")
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit() {
    if (!form.title || !form.url) return alert("제목과 URL을 입력하세요.");
    setLoading(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        title: form.title,
        url: form.url,
        description: form.description,
        image_url: imageUrl,
      };

      if (editId) {
        await supabase.from("repository_shortcuts").update(payload).eq("id", editId);
        setEditId(null);
      } else {
        await supabase.from("repository_shortcuts").insert([payload]);
      }

      setForm({ title: "", url: "", description: "", image_url: "" });
      setImageFile(null);
      fetchShortcuts();
    } catch (err) {
      alert("오류: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item) {
    setEditId(item.id);
    setForm({
      title: item.title || "",
      url: item.url || "",
      description: item.description || "",
      image_url: item.image_url || "",
    });
    setImageFile(null);
  }

  async function handleDelete(id) {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("repository_shortcuts").delete().eq("id", id);
    fetchShortcuts();
  }

  function handleCancel() {
    setEditId(null);
    setForm({ title: "", url: "", description: "", image_url: "" });
    setImageFile(null);
  }

  return (
    <div className="manager-panel">
      <h3 className="manager-title">{editId ? "바로가기 수정" : "바로가기 추가"}</h3>

      <div className="manager-form">
        <input
          type="text"
          placeholder="제목"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="URL (https://...)"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />
        <input
          type="text"
          placeholder="짧은 설명 (선택)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="image-upload-row">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {form.image_url && !imageFile && (
            <span className="current-image-hint">현재 이미지 유지</span>
          )}
        </div>

        <div className="form-buttons">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "저장 중..." : editId ? "수정 완료" : "추가"}
          </button>
          {editId && (
            <button className="cancel-btn" onClick={handleCancel}>
              취소
            </button>
          )}
        </div>
      </div>

      <div className="manager-list">
        {shortcuts.map((item) => (
          <div key={item.id} className="manager-item">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="item-thumb" />
            )}
            <div className="item-info">
              <span className="item-title">{item.title}</span>
              {item.description && (
                <span className="item-desc">{item.description}</span>
              )}
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-url">
                {item.url}
              </a>
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(item)}>수정</button>
              <button onClick={() => handleDelete(item.id)} className="delete-btn">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
