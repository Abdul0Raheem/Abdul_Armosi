"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { collection, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { groupCategoriesByGroup } from "@/lib/admin/categories";
import { resolveCategorySlug } from "@/lib/admin/categoryDefaults";
import { prepareProductImage, withTimeout } from "@/lib/admin/productImage";
import { parseStockInput } from "@/lib/admin/productUtils";
import { Product, StoreCategory } from "@/lib/admin/types";

interface ProductFormProps {
  product?: Product | null;
  categories: StoreCategory[];
  onCategoriesChange?: () => Promise<void>;
  onProductSaved: () => void;
  onCancel: () => void;
}

const MAX_IMAGE_DATA_URL_LENGTH = 280_000;
const FIRESTORE_TIMEOUT_MS = 25_000;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read this image file."));
    image.src = src;
  });
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read this image file."));
    reader.readAsDataURL(file);
  });
}

async function compressImageToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const maxSide = 720;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not process this image.");
  }

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.75, 0.65, 0.55, 0.45, 0.35, 0.28]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH) {
      return dataUrl;
    }
  }

  throw new Error("This image is still too large. Use a smaller photo or paste an image URL.");
}

function buildFormState(product?: Product | null) {
  const image = product?.image || "";
  return {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price != null ? product.price.toString() : "",
    category: product?.category ? resolveCategorySlug(product.category) : "",
    stock:
      product?.stock !== null && product?.stock !== undefined
        ? product.stock.toString()
        : "",
    productImage: image,
    imageUrlInput: image.startsWith("http://") || image.startsWith("https://") ? image : "",
  };
}

export default function ProductForm({
  product,
  categories,
  onProductSaved,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState(() => buildFormState(product));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      imageUrlInput: value,
      productImage: value.trim(),
    }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    try {
      const imageDataUrl = await compressImageToDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        productImage: imageDataUrl,
        imageUrlInput: "",
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  const clearImage = () => {
    setFormData((prev) => ({
      ...prev,
      productImage: "",
      imageUrlInput: "",
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const productId = product?.id;
      const image = prepareProductImage(formData.productImage, product?.image);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        stock: parseStockInput(formData.stock),
        image,
        updatedAt: Timestamp.now(),
      };

      if (productId) {
        await withTimeout(
          updateDoc(doc(db, "products", productId), productData),
          FIRESTORE_TIMEOUT_MS,
          "Save timed out. Check your internet connection and try again.",
        );
      } else {
        await withTimeout(
          addDoc(collection(db, "products"), {
            ...productData,
            createdAt: Timestamp.now(),
          }),
          FIRESTORE_TIMEOUT_MS,
          "Save timed out. Check your internet connection and try again.",
        );
      }

      setLoading(false);
      onProductSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("permission") || message.includes("PERMISSION_DENIED")) {
        setError("Failed to save. Please log out and log in again.");
      } else {
        setError(`Failed to save product. ${message}`);
      }
      console.error("ProductForm: save error", err);
      setLoading(false);
    }
  };

  const hasUploadedImage = Boolean(formData.productImage);
  const imageIsDataUrl = formData.productImage.startsWith("data:");
  const categoryGroups = groupCategoriesByGroup(categories);

  return (
    <div className="adm-card adm-card-padded" style={{ marginBottom: 24 }}>
      <h2 className="adm-page-title" style={{ fontSize: '1.5rem', marginBottom: 16 }}>
        {product ? "Edit Product" : "Add New Product"}
      </h2>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div>
            <label className="adm-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="adm-input"
            />
          </div>

          <div>
            <label className="adm-label">Price (Rs.)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              required
              className="adm-input"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="adm-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={categories.length === 0}
              className="adm-select"
            >
              <option value="">
                {categories.length === 0 ? "Loading categories..." : "Select a category"}
              </option>
              {categoryGroups.map(({ group, categories: groupCategories }) => (
                <optgroup key={group} label={group}>
                  {groupCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p style={{ fontSize: 12, color: 'var(--adm-muted)', marginTop: 6 }}>
              Categories are loaded from the store catalog (same as the website).
            </p>
          </div>

          <div>
            <label className="adm-label">
              Stock <span style={{ color: 'var(--adm-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min={0}
              placeholder="Leave empty if not tracking stock"
              className="adm-input"
            />
          </div>
        </div>

        <div>
          <label className="adm-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="adm-textarea"
          />
        </div>

        <div>
          <label className="adm-label">Product Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="adm-input"
            style={{ marginBottom: 12, paddingTop: 10, paddingBottom: 10 }}
          />
          <label className="adm-label">Or paste image URL</label>
          <input
            type="url"
            value={formData.imageUrlInput}
            onChange={handleImageUrlChange}
            placeholder="https://example.com/product-image.jpg"
            className="adm-input"
          />
          <p style={{ fontSize: 13, color: 'var(--adm-muted)', marginTop: 8 }}>
            Tip: Image URL links save fastest. Phone uploads are compressed automatically.
          </p>
          {imageIsDataUrl && (
            <p style={{ fontSize: 13, color: 'var(--adm-muted)', marginTop: 4 }}>
              Photo ready from your device.
            </p>
          )}
          {hasUploadedImage && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <img
                src={formData.productImage}
                alt="Preview"
                style={{ width: 128, height: 128, objectFit: 'cover', borderRadius: 14, border: '1px solid var(--adm-line)' }}
              />
              <button type="button" onClick={clearImage} className="adm-btn adm-btn-ghost adm-btn-sm">
                Remove image
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button type="submit" disabled={loading} className="adm-btn adm-btn-primary">
            {loading ? "Saving..." : product ? "Update Product" : "Save Product"}
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className="adm-btn adm-btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
