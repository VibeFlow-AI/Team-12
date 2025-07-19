"use client";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import Image from "next/image";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const profileImages = [
  "/hero/1.png",
  "/hero/2.png",
  "/hero/3.png",
  "/hero/4.png",
  "/hero/5.png",
  "/hero/6.png",
  "/hero/7.png",
];

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="min-h-screen pt-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl flex-col items-center gap-6 lg:flex-row">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center space-y-8 text-center lg:flex-1 lg:items-start lg:text-left"
          >
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl font-medium  text-gray-900 lg:text-6xl"
              >
                Empowering Students with Personalized Mentorship{" "}
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="inline-block"
                >
                  <BookOpen className="h-12 w-12 text-gray-700 lg:h-16 lg:w-16" />
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="max-w-lg text-lg text-gray-600 lg:text-xl"
              >
                EduVibe connects students with experienced mentors to guide them
                through their academic journey and beyond.
              </motion.p>
            </div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="bg-black px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-gray-800 rounded-lg"
            >
              Get Started
            </motion.button>
          </motion.div>
          {/* Right Side - Animated Profile Images (Hidden on small screens) */}
          <div className="relative hidden h-[500px] lg:block lg:flex-1">
            {/* Column 1 (h-52) */}
            <motion.div
              animate={{ y: [-20, -60, -20] }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "linear",
              }}
              className="absolute right-72 top-0 space-y-6"
            >
              {[...profileImages, ...profileImages].map((src, index) => (
                <motion.div
                  key={`col1-${index}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  className="h-52 w-32 flex-shrink-0 overflow-hidden rounded-full shadow-lg"
                >
                  <Image
                    src={src || "/placeholder.svg"}
                    alt={`Profile ${index + 1}`}
                    width={128}
                    height={208}
                    className="h-full w-full rounded-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
            {/* Column 2 (h-80) */}
            <motion.div
              animate={{ y: [20, 60, 20] }}
              transition={{
                duration: 25,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "linear",
              }}
              className="absolute right-36 top-12 space-y-6"
            >
              {[...profileImages.slice(2), ...profileImages.slice(2)].map(
                (src, index) => (
                  <motion.div
                    key={`col2-${index}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="h-80 w-32 flex-shrink-0 overflow-hidden rounded-full shadow-lg"
                  >
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={`Profile ${index + 1}`}
                      width={128}
                      height={320}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </motion.div>
                )
              )}
            </motion.div>
            {/* Column 3 (h-52) */}
            <motion.div
              animate={{ y: [-30, -70, -30] }}
              transition={{
                duration: 18,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                ease: "linear",
              }}
              className="absolute right-0 top-0 space-y-6"
            >
              {[...profileImages.slice(4), ...profileImages.slice(4)].map(
                (src, index) => (
                  <motion.div
                    key={`col3-${index}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    className="h-52 w-32 flex-shrink-0 overflow-hidden rounded-full shadow-lg"
                  >
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={`Profile ${index + 1}`}
                      width={128}
                      height={208}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </motion.div>
                )
              )}
            </motion.div>
          </div>
        </div>

        {/* Fade Effect at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
