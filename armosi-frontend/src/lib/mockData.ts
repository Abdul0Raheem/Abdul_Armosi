export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export const trendingProducts: Product[] = [
  { id: '1', name: 'Premium Fountain Pen', price: 1299, image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Pens' },
  { id: '2', name: 'Leather Bound Journal', price: 899, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Notebooks' },
  { id: '3', name: 'Pastel Highlighters Set', price: 450, image: 'https://images.unsplash.com/photo-1527736947477-2790e28f1436?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Art Supplies' },
  { id: '4', name: 'Minimalist Desk Organizer', price: 1599, image: 'https://images.unsplash.com/photo-1589363460779-cbdf23f1361c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Accessories' },
];

export const stationeryProducts: { title: string; items: Product[] }[] = [
  {
    title: 'Pens & Writing',
    items: [
      { id: 'p1', name: 'Executive Gel Pen', price: 299, image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Pens' },
      { id: 'p2', name: 'Calligraphy Set', price: 1499, image: 'https://images.unsplash.com/photo-1507111244346-621c81cf5d85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Pens' },
      { id: 'p3', name: 'Fineliner Color Pens', price: 699, image: 'https://images.unsplash.com/photo-1520005705333-3118ee6a536f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Pens' },
    ]
  },
  {
    title: 'Notebooks & Journals',
    items: [
      { id: 'n1', name: 'Spiral Sketchbook', price: 350, image: 'https://images.unsplash.com/photo-1531346878377-a541e4a0ecce?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Notebooks' },
      { id: 'n2', name: 'Dotted Grid Notebook', price: 599, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Notebooks' },
      { id: 'n3', name: 'Softcover Planner', price: 799, image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', category: 'Notebooks' },
    ]
  }
];

export const customizeCategories = [
  { id: 'c1', name: 'Custom Pens', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
  { id: 'c2', name: 'Personalized Books', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
  { id: 'c3', name: 'Writing Pads', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
  { id: 'c4', name: 'Engraved Frames', image: 'https://images.unsplash.com/photo-1580461046754-ca2f0739f60a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' },
];
