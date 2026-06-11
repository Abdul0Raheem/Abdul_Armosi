"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { collection, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { groupCategoriesByGroup } from "@/lib/admin/categories";
import { resolveCategorySlug } from "@/lib/admin/categoryDefaults";
import { uploadToCloudinary } from "@/lib/admin/cloudinary";
import { withTimeout } from "@/lib/admin/productImage";
import { parseStockInput } from "@/lib/admin/productUtils";
import { Product, StoreCategory } from "@/lib/admin/types";
import { ProductImageFrame } from '@/components/common/ProductImageFrame';

interface ProductFormProps {
  product?: Product | null;
  categories: StoreCategory[];
  onCategoriesChange?: () => Promise<void>;
  onProductSaved: () => void;
  onCancel: () => void;
}

const FIRESTORE_TIMEOUT_MS = 25_000;

function buildFormState(product?: Product | null) {
  const imageUrl = product?.imageUrl || product?.image || "";
  return {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price != null ? product.price.toString() : "",
    category: product?.category ? resolveCategorySlug(product.category) : "",
    stock:
      product?.stock !== null && product?.stock !== undefined
        ? product.stock.toString()
        : "",
    existingImageUrl: imageUrl,
  };
}

export default function ProductForm({
  product,
  categories,
  onProductSaved,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState(() => buildFormState(product));
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(() => formData.existingImageUrl);
  const objectUrlRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }

      setSelectedImage(null);
      setImagePreviewUrl(formData.existingImageUrl);
      setError("Please choose an image file.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setSelectedImage(file);
    setImagePreviewUrl(objectUrl);
  };

  const clearImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }

    setSelectedImage(null);
    setFormData((prev) => ({ ...prev, existingImageUrl: "" }));
    setImagePreviewUrl("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setUploading(false);

    try {
      const productId = product?.id;
      let imageUrl = formData.existingImageUrl;

      if (!selectedImage && !imageUrl) {
        throw new Error("Please select a product image before saving.");
      }

      if (selectedImage) {
        setUploading(true);
        imageUrl = await uploadToCloudinary(selectedImage);
        setUploading(false);
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        stock: parseStockInput(formData.stock),
        imageUrl,
        image: imageUrl,
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
      setUploading(false);
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

  const hasSelectedImage = Boolean(imagePreviewUrl);
  const categoryGroups = groupCategoriesByGroup(categories);
  const submitDisabled = loading || uploading;

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
          <label className="adm-label">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="adm-input"
            style={{ marginBottom: 12, paddingTop: 10, paddingBottom: 10 }}
          />
          <p style={{ fontSize: 13, color: 'var(--adm-muted)', marginTop: 8 }}>
            Choose a product photo from your device. It will upload to Cloudinary when you save.
          </p>
          {uploading && (
            <p style={{ fontSize: 13, color: 'var(--adm-muted)', marginTop: 4 }}>
              Uploading image...
            </p>
          )}
          {hasSelectedImage && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 128, minWidth: 128, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--adm-line)' }}>
                <ProductImageFrame
                  src={imagePreviewUrl}
                  alt="Preview"
                  fallbackText="Preview unavailable"
                  background="#FFFFFF"
                  height={128}
                  style={{ borderRadius: 14 }}
                />
              </div>
              <button type="button" onClick={clearImage} disabled={submitDisabled} className="adm-btn adm-btn-ghost adm-btn-sm">
                Remove image
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button type="submit" disabled={submitDisabled} className="adm-btn adm-btn-primary">
            {uploading ? "Uploading image..." : loading ? "Saving..." : product ? "Update Product" : "Save Product"}
          </button>
          <button type="button" onClick={onCancel} disabled={submitDisabled} className="adm-btn adm-btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
