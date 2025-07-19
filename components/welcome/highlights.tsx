"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark } from "lucide-react"

const sessionsData = [
  {
    id: 1,
    instructor: "Rahul Lavan",
    location: "Colombo",
    initials: "RL",
    initialsColor: "bg-blue-500",
    subjects: ["Science", "Physics", "Biology"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    duration: "30 mins - 1 hour",
    language: "English, Tamil",
  },
  {
    id: 2,
    instructor: "Chathum Rahal",
    location: "Galle",
    initials: "CR",
    initialsColor: "bg-orange-500",
    subjects: ["Mathematics", "History", "English"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    duration: "1 hour",
    language: "English",
  },
  {
    id: 3,
    instructor: "Malsha Fernando",
    location: "Colombo",
    initials: "MI",
    initialsColor: "bg-pink-500",
    subjects: ["Chemistry", "Art", "Commerce"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    duration: "1 hour",
    language: "Sinhala",
  },
]

export default function SessionHighlights() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 relative overflow-hidden">
      {/* Gradient Background Circles - From Sides */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-radial from-green-300/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 -right-32 w-80 h-80 bg-gradient-radial from-blue-300/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-72 h-72 bg-gradient-radial from-purple-300/40 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Session Highlights – Trending Now
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
            Join the sessions students are raving about. These expert-led, high-impact sessions are designed to help you
            unlock your full potential whether you're polishing your resume, mapping out your career path, or getting
            ready to ace technical interviews.
          </p>
        </div>

        {/* Session Cards */}
        <div className="w-full flex justify-center mb-8 sm:mb-10">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessionsData.map((session) => (
                <div key={session.id} className="relative">
                  {/* Main Card */}
                  <Card className="bg-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 pb-20 relative overflow-hidden">
                    <CardContent className="p-6">
                      {/* Instructor Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-12 h-12 ${session.initialsColor} rounded-lg flex items-center justify-center`}
                        >
                          <span className="text-white font-bold text-lg">{session.initials}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{session.instructor}</h3>
                          <p className="text-sm text-gray-600">{session.location}</p>
                        </div>
                      </div>

                      {/* Subject Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {session.subjects.map((subject, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{session.description}</p>

                      {/* Session Details */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">Duration:</span>
                          <span className="text-gray-600">{session.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">Preferred Language:</span>
                          <span className="text-gray-600">{session.language}</span>
                        </div>
                      </div>
                    </CardContent>

                    {/* Curved Cutout */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50">
                      <svg
                        className="absolute top-0 left-0 w-full h-8"
                        viewBox="0 0 400 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0 32V16C50 0 100 0 150 8C200 16 250 16 300 8C350 0 400 0 400 16V32H0Z" fill="white" />
                      </svg>
                    </div>
                  </Card>

                  {/* Action Buttons - Outside the card */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-b-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">Book a session</Button>
                      <Button variant="outline" size="icon" className="border-gray-300 hover:bg-gray-50 bg-transparent">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <Button variant="outline" className="px-8 py-2 border-gray-300 hover:bg-white/50 bg-transparent">
            Load More Sessions
          </Button>
        </div>
      </div>
    </section>
  )
}
