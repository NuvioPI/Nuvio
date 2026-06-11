"use client";

import Image from "next/image";
import { useState } from "react";

import { motion } from "framer-motion";

import {
  Montserrat,
  Playfair_Display,
} from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main
      className="
        relative
        flex
        h-screen
        items-center
        justify-center
        overflow-hidden
        bg-[#020617]
      "
    >
      {/* BACKGROUND */}
      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_45%)]
        "
      />

      {/* MAIN LIGHT */}
      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-[-300px]
          h-[700px]
          w-[900px]
          rounded-full
          bg-emerald-400/20
          blur-3xl
        "
      />

      {/* LIGHT BEAM */}
      <motion.div
        animate={{
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-0
          h-[500px]
          w-[700px]
          bg-emerald-300/10
          blur-[120px]
          rotate-[-8deg]
        "
      />

      {/* EXTRA GLOW */}
      <div
        className="
          absolute
          top-[20%]
          h-[400px]
          w-[400px]
          rounded-full
          bg-emerald-500/10
          blur-[120px]
        "
      />

      {/* CARD */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
          filter: "blur(10px)",
        }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`
          ${montserrat.className}
          relative
          z-10
          w-full
          max-w-md
          rounded-[32px]
          border
          border-white/10
          bg-white/[0.03]
          backdrop-blur-2xl
          p-8
          shadow-[0_0_80px_rgba(16,185,129,0.12)]
        `}
      >
        {/* TITLE */}
        <h1 className="text-5xl font-bold text-white">
          Welcome to{" "}
          <span
            className={
              playfairDisplay.className
            }
          >
            Nuvio
          </span>
          !
        </h1>

        {/* SUBTITLE */}
        <p className="mt-3 text-gray-400">
          Login to your account ☁️
        </p>

        {/* FORM */}
        <form
          className="mt-8"
          onSubmit={handleLogin}
        >
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="
              mt-4
              w-full
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              p-3
              text-white
              outline-none
              transition-all
              duration-300
              placeholder:text-gray-500
              focus:border-emerald-400/40
              focus:bg-white/[0.05]
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
              mt-4
              w-full
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              p-3
              text-white
              outline-none
              transition-all
              duration-300
              placeholder:text-gray-500
              focus:border-emerald-400/40
              focus:bg-white/[0.05]
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />

          {/* BUTTON */}
          <button
            type="submit"
            className="
              mt-6
              w-full
              rounded-xl
              bg-white
              p-3
              font-medium
              text-black
              transition-all
              duration-300
              hover:scale-[1.02]
              hover:bg-emerald-100
              active:scale-[0.99]
              shadow-[0_0_40px_rgba(255,255,255,0.15)]
              cursor-pointer
            "
          >
            Login
          </button>

          {/* DIVIDER */}
          <p
            className="
              flex
              items-center
              justify-center
              gap-2
              p-4
              text-white
            "
          >
            Or
          </p>

          {/* GOOGLE */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="
                group
                flex
                items-center
                overflow-hidden
                h-14
                w-14
                hover:w-56
                px-4
                text-white
                bg-white/[0.03]
                border
                border-white/10
                rounded-xl
                backdrop-blur-xl
                transition-all
                duration-300
                ease-in-out
                hover:bg-white
                hover:text-black
                cursor-pointer
              "
            >
              <Image
                src="/google-icon.png"
                alt="Google"
                width={20}
                height={20}
                className="
                  min-w-[20px]
                  brightness-0
                  invert
                  transition-all
                  duration-300
                  group-hover:brightness-100
                  group-hover:invert-0
                "
              />

              <span
                className="
                  ml-3
                  whitespace-nowrap
                  opacity-0
                  -translate-x-3
                  transition-all
                  duration-300
                  group-hover:translate-x-0
                  group-hover:opacity-100
                "
              >
                Entrar com Google
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}