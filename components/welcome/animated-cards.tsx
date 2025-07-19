"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cardsData = [
  {
    id: 1,
    title: "Personalized Learning",
    description:
      "We tailor the mentorship experience to fit each student's unique goals, learning style, and pace making every session impactful.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    title: "Real Mentors, Real Guidance",
    description:
      "Connect with experienced professionals who provide authentic insights and practical advice for your career journey.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    title: "Growth & Career Readiness",
    description:
      "Develop essential skills and gain industry knowledge that prepares you for success in your chosen field.",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 4,
    title: "Insights-Driven Support",
    description:
      "Leverage data-driven insights and analytics to track your progress and optimize your learning experience.",
    image: "/placeholder.svg?height=400&width=600",
  },
];

export default function AnimatedCardsSection() {
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cardsData.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gradient-to-b from-green-50 to-green-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {"What's in it for Students?"}
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            EduVibe is a student-mentor platform designed to personalize
            learning journeys. It connects students with mentors who offer
            guidance, support, and practical industry insights.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
          {cardsData.map((card, index) => (
            <motion.div
              key={card.id}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 h-[400px] sm:h-[450px] lg:h-[500px] ${
                activeCard === index
                  ? "lg:col-span-2 shadow-2xl scale-[1.02]"
                  : "lg:col-span-1 shadow-lg hover:shadow-xl"
              }`}
              layout
              transition={{
                layout: { duration: 0.6, ease: "easeInOut" },
              }}
              onClick={() => setActiveCard(index)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={card.image || "/placeholder.svg"}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-4 sm:p-5 lg:p-6 text-gray-900">
                <motion.h3
                  className="text-base sm:text-lg lg:text-xl font-bold mb-2 leading-tight text-gray-900"
                  layout="position"
                >
                  {card.title}
                </motion.h3>

                <AnimatePresence mode="wait">
                  {activeCard === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="text-xs sm:text-sm lg:text-sm text-gray-700 leading-relaxed line-clamp-4"
                    >
                      {card.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Active Card Indicator */}
              {activeCard === index && (
                <motion.div
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-2 h-2 sm:w-3 sm:h-3 bg-gray-900 rounded-full shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                />
              )}

              {/* Card Border for Active State */}
              {activeCard === index && (
                <motion.div
                  className="absolute inset-0 border-2 border-gray-900/20 rounded-2xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
          {cardsData.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveCard(index)}
              className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                activeCard === index
                  ? "bg-green-600 w-6 sm:w-8"
                  : "bg-gray-300 hover:bg-gray-400 w-2 sm:w-3"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
