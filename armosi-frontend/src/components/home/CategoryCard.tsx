"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  href: string;
  image: string;
  delay?: number;
}

export function CategoryCard({ title, href, image, delay = 0 }: CategoryCardProps) {
  return (
    <Link href={href} className="block w-full">
      <motion.div
        className="relative h-48 md:h-64 rounded-3xl overflow-hidden group cursor-pointer shadow-lg shadow-gray-100 bg-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.02, rotate: 1 }}
        whileTap={{ scale: 0.98 }}
      >
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/80 via-violet-900/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 flex items-end justify-between">
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
            {title}
          </h3>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-violet-600 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
