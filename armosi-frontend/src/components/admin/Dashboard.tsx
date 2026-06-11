"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, StoreCategory, Order } from "@/lib/admin/types";
import { ensureStoreCategoriesSeeded, fetchStoreCategories } from "@/lib/admin/categories";
import { useRealtimeOrders } from "@/hooks/admin/useRealtimeOrders";
import {
  notifyAdminNewOrder,
  requestAdminNotificationPermission,
} from "@/lib/admin/orderNotifications";
import ProductForm from "./ProductForm";
import ProductListByCategory from "./ProductListByCategory";
import OrdersPanel from "./OrdersPanel";

interface DashboardProps {
  initialTab?: "orders" | "products";
}

export default function Dashboard({ initialTab = "orders" }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "products">(initialTab);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    return Notification.permission;
  });
  const handleNewOrder = useCallback((order: Order) => {
    notifyAdminNewOrder(order);
    setLatestOrder(order);
    setNewOrderCount(count => count + 1);
  }, []);

  const { orders, setOrders, loading: ordersLoading } = useRealtimeOrders(handleNewOrder);

  useEffect(() => {
    if (!latestOrder) return;
    const timer = window.setTimeout(() => setLatestOrder(null), 12000);
    return () => window.clearTimeout(timer);
  }, [latestOrder]);

  const selectTab = (tab: "orders" | "products") => {
    setActiveTab(tab);
    if (tab === "orders") {
      setNewOrderCount(0);
    }
  };

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const categoryList = await ensureStoreCategoriesSeeded();
      setCategories(categoryList);

      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData: Product[] = [];
      querySnapshot.forEach((document) => {
        const data = document.data();
        const stockValue = data.stock;
        const imageUrl = data.imageUrl || data.image || "";

        productsData.push({
          id: document.id,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          image: imageUrl,
          imageUrl,
          stock:
            stockValue === null || stockValue === undefined
              ? null
              : Number(stockValue),
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading catalog:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "products") {
      void Promise.resolve().then(loadCatalog);
    }
  }, [activeTab, loadCatalog]);

  const refreshCategories = async () => {
    const categoryList = await fetchStoreCategories();
    setCategories(categoryList);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleProductSaved = async () => {
    await loadCatalog();
    setShowForm(false);
    setEditingProduct(null);
  };

  const enableNotifications = async () => {
    const permission = await requestAdminNotificationPermission();
    if (permission === "unsupported") {
      setNotificationPermission("unsupported");
      return;
    }
    setNotificationPermission(permission);
  };

  return (
    <div className="adm-page">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 className="adm-page-title">
              {activeTab === 'orders' ? 'Orders' : 'Products'}
            </h1>
            <p className="adm-page-subtitle">
              {activeTab === 'orders'
                ? 'Live order alerts while this page is open.'
                : 'Manage your catalog by category — same as the storefront.'}
            </p>
          </div>

          {notificationPermission !== "granted" && notificationPermission !== "unsupported" && activeTab === 'orders' && (
            <button type="button" onClick={enableNotifications} className="adm-btn adm-btn-secondary adm-btn-sm">
              Enable notifications
            </button>
          )}
        </div>

        <div className="adm-tabs">
          <button
            type="button"
            onClick={() => selectTab("orders")}
            className={`adm-tab ${activeTab === "orders" ? "adm-tab-active" : ""}`}
          >
            Orders
            {newOrderCount > 0 && activeTab !== "orders" && (
              <span className="adm-tab-badge">{newOrderCount}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => selectTab("products")}
            className={`adm-tab ${activeTab === "products" ? "adm-tab-active" : ""}`}
          >
            Products
          </button>
        </div>
      </div>

      {latestOrder && activeTab !== "orders" && (
        <button type="button" onClick={() => selectTab("orders")} className="adm-alert" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 700, color: 'var(--adm-primary-dark)' }}>New order received</p>
          <p style={{ fontSize: 14, color: 'var(--adm-ink)', marginTop: 4 }}>
            {latestOrder.customer?.name} · Rs. {latestOrder.summary?.total} · {latestOrder.id}
          </p>
          <p style={{ fontSize: 12, color: 'var(--adm-muted)', marginTop: 4 }}>Tap to open Orders</p>
        </button>
      )}

      {activeTab === "orders" ? (
        <OrdersPanel
          orders={orders}
          loading={ordersLoading}
          setOrders={setOrders}
          highlightOrderId={latestOrder?.id ?? null}
        />
      ) : (
        <>
          {!showForm && !editingProduct && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="adm-btn adm-btn-primary"
              style={{ marginBottom: 20 }}
            >
              + Add New Product
            </button>
          )}

          {(showForm || editingProduct) && (
            <ProductForm
              key={editingProduct?.id ?? "new-product"}
              product={editingProduct}
              categories={categories}
              onCategoriesChange={refreshCategories}
              onProductSaved={handleProductSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          )}

          {loading ? (
            <div className="adm-empty">Loading products...</div>
          ) : (
            <ProductListByCategory
              products={products}
              categories={categories}
              onEdit={(product) => {
                setEditingProduct(product);
                setShowForm(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onDelete={handleDeleteProduct}
            />
          )}
        </>
      )}
    </div>
  );
}
