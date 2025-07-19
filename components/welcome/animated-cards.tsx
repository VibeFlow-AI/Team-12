"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cardsData = [
  {
    id: 1,
    title: "Personalized Learning",
    description:
      "We tailor the mentorship experience to fit each student's unique goals, learning style, and pace making every session impactful.",
    image: "/about/1.png",
  },
  {
    id: 2,
    title: "Real Mentors, Real Guidance",
    description:
      "Connect with experienced professionals who provide authentic insights and practical advice for your career journey.",
    image: "/about/2.png",
  },
  {
    id: 3,
    title: "Growth & Career Readiness",
    description:
      "Develop essential skills and gain industry knowledge that prepares you for success in your chosen field.",
    image: "/about/3.png",
  },
  {
    id: 4,
    title: "Insights-Driven Support",
    description:
      "Leverage data-driven insights and analytics to track your progress and optimize your learning experience.",
    image: "/about/4.png",
  },
];

export default function AnimatedCardsSection() {
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % cardsData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-8 sm:py-12 lg:py-16" id="about">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-medium text-gray-900 mb-3 sm:mb-4">
            {"What's in it for Students?"}
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600">
            EduVibe is a student-mentor platform designed to personalize
            learning journeys. It connects students with mentors who offer
            guidance, support, and practical industry insights.
          </p>
        </div>

        {/* Cards - Flex Centered */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl flex flex-wrap justify-center gap-4 lg:gap-6">
            {cardsData.map((card, index) => (
              <motion.div
                key={card.id}
                className={`relative overflow-hidden cursor-pointer transition-all duration-500 ${
                  activeCard === index
                    ? "w-[300px] sm:w-[350px] shadow-xl"
                    : "w-[150px] sm:w-[180px] shadow-lg hover:shadow-xl"
                } h-[350px] sm:h-[400px] lg:h-[450px]`}
                style={{
                  borderRadius: "1rem",
                }}
                layout
                transition={{
                  layout: { duration: 0.6, ease: "easeInOut" },
                }}
                onClick={() => setActiveCard(index)}
              >
                {/* Background Image */}
                <div className="absolute inset-0 -m-2">
                  <img
                    src={card.image || "/placeholder.svg"}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    style={{
                      borderRadius: "1.5rem",
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent"
                    style={{
                      borderRadius: "1.5rem",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-4 sm:p-5 lg:p-6 text-gray-900 z-10">
                  <motion.h3
                    className="text-base sm:text-lg lg:text-xl font-medium mb-2 leading-tight text-gray-900"
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
                        className="text-xs sm:text-sm lg:text-sm text-gray-700 leading-relaxed"
                      >
                        {card.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active Indicator */}
                {activeCard === index && (
                  <motion.div
                    className="absolute top-4 right-4 w-2 h-2 sm:w-3 sm:h-3 bg-gray-900 rounded-full shadow-lg z-20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        {/* <div className="flex justify-center mt-8 sm:mt-10 space-x-2">
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
        </div> */}
      </div>
    </section>
  );
}
