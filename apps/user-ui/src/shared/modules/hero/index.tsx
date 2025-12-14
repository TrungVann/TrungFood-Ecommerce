"use client";
import React from "react";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative w-full h-[85vh] bg-[#0f3f4c] overflow-hidden flex items-center">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#115061] via-[#0c3640] to-[#08262d] opacity-90" />

      {/* Decorative circles */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#1e6f82] rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#1c8fa6] rounded-full blur-3xl opacity-20" />

      <div className="relative z-10 w-[90%] md:w-[80%] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:w-1/2"
        >
          <p className="text-white/90 text-lg md:text-xl font-light tracking-wide">
            Starting from <span className="font-semibold">$40</span>
          </p>

          <h1 className="mt-2 text-white text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-sm">
            Premium Watch
            <br /> Collection 2025
          </h1>

          <p className="text-[#ffe07a] font-Oregano text-3xl mt-4 drop-shadow-md">
            Exclusive offer <span className="text-white font-bold">10%</span>{" "}
            off this week
          </p>

          <button
            onClick={() => router.push("/products")}
            className="mt-6 px-5 py-3 rounded-2xl bg-white text-[#115061] font-semibold flex items-center gap-2 hover:bg-[#ffeab3] hover:text-[#0a3a47] transition-all shadow-md"
          >
            Shop Now <MoveRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="md:w-1/2 flex justify-center"
        >
          <div className="relative w-[280px] md:w-[420px] aspect-square rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10">
            <Image
              src="https://ik.imagekit.io/trungvan/products/bannerkfc.jpg?updatedAt=1765510367674"
              alt="Hero Image"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
