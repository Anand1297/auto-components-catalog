import { useEffect, useState, type FormEvent } from "react";
import categoryService from "../../../services/CategoryService";
import type { Category } from "../../../models/Category";
import "./AdminCategoriesPage.css";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const load = () => categoryService.getCategories().then(setCategories).catch((e) => setError(e.message ?? "Unable to load categories."));
  useEffect(() => { load(); }, []);
  const reset = () => { setEditing(null); setName(""); setParentId(""); setDescription(""); setImageUrl(""); };
  const edit = (c: Category) => { setEditing(c); setName(c.name); setParentId(c.parentId ?? ""); setDescription(c.description); setImageUrl(c.image === "/categories/default.png" ? "" : c.image); };
  const submit = async (e: FormEvent) => { e.preventDefault(); setError(""); try { const input = { name, parentId: parentId || null, description, imageUrl }; if (editing) await categoryService.updateCategory(editing.id, input); else await categoryService.createCategory(input); reset(); load(); } catch (err) { setError(err instanceof Error ? err.message : "Unable to save category."); } };
  const remove = async (c: Category) => { if (!window.confirm(`Delete ${c.name}?`)) return; try { await categoryService.deleteCategory(c.id); load(); } catch (err) { setError(err instanceof Error ? err.message : "Unable to delete category."); } };

  return <div className="admin-categories-page"><div className="admin-categories-page__header"><div><h1>Categories</h1><p>Create any depth of business categories using parent categories.</p></div></div>{error && <div>{error}</div>}
    <form className="admin-categories-page__form" onSubmit={submit}><input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} required /><select value={parentId} onChange={(e) => setParentId(e.target.value)}><option value="">Root category</option>{categories.filter((c) => c.id !== editing?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /><input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /><button type="submit">{editing ? "Update" : "Add Category"}</button>{editing && <button type="button" onClick={reset}>Cancel</button>}</form>
    <div className="admin-categories-page__grid">{categories.map((c) => <div key={c.id} className="admin-categories-page__card"><div><strong>{c.name}</strong><p>{c.parentId ? `Child category` : "Root category"}</p></div><div><button type="button" onClick={() => edit(c)}>Edit</button><button type="button" onClick={() => remove(c)}>Delete</button></div></div>)}</div>
  </div>;
}
