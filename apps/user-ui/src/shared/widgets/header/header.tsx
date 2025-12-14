"use client";
import Link from "next/link";
import React, { useState } from "react";

import HeaderBottom from "./header-bottom";

import { Search } from "lucide-react";
import { CircleUser } from "lucide-react";
import { Heart } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state:any) => state.wishlist)
  const cart = useStore((state:any) => state.cart)

  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // const handleSearchClick = async () => {
  //   if(!searchQuery.trim()) return;
  //   setLoadingSuggestions(true)
  //   try {
  //     const res = await axiosInstance.get(`/product`)
  //     setSuggestions(res.data.products.slice(0, 10))
  //   } catch (error) {
  //   } finally {
  //     setLoadingSuggestions(false)

  //   }
  // }

  return (
    <div className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href={"/"}>
            <span className="text-2xl font-[600]">TrungFood</span>
          </Link>
        </div>
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#FF541B] outline-none h-[55px]"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#FF541B] absolute top-0 right-0">
            <Search color="#fff" />
          </div>
        </div>
        <div className="flex items-center gap-8 pb-2">
          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                <Link href={"/profile"}>
                  <CircleUser className="w-[40px] h-[40px]" color="#FF541B" />
                </Link>
                <Link href={"/profile"}>
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">{user?.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={"/login"}
                  className="flex items-center justify-center mr-5"
                >
                  <CircleUser className="w-[40px] h-[40px]" color="#FF541B" />
                </Link>
                <Link href={"/login"}>
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">
                    {isLoading ? "..." : "Sign In"}
                  </span>
                </Link>
              </>
            )}
          </div>

          {/** Wishlist & Cart */}
          <div className="flex items-center gap-5">
            <Link href={"/wishlist"} className="relative">
              <Heart />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">{wishlist?.length}</span>
              </div>
            </Link>
            <Link href={"/cart"} className="relative">
              <ShoppingCart />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">{cart?.length}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-[#99999938]"></div>
      <HeaderBottom />
    </div>
  );
};

export default Header;
