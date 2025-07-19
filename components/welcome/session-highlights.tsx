"use client";

interface Mentor {
  initials: string;
  name: string;
  color: string;
  subjects: { text: string; bgColor: string; textColor: string }[];
  duration: string;
  languages: string;
  description: string;
}

const mentors: Mentor[] = [
  {
    initials: "RL",
    name: "Rahul Lavan",
    color: "bg-blue-500",
    subjects: [
      { text: "Science", bgColor: "bg-blue-100", textColor: "text-blue-800" },
      { text: "Physics", bgColor: "bg-green-100", textColor: "text-green-800" },
      { text: "Biology", bgColor: "bg-purple-100", textColor: "text-purple-800" },
    ],
    duration: "45 mins - 1 hour",
    languages: "English, Tamil",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
  {
    initials: "CR",
    name: "Chathurn Rahal",
    color: "bg-orange-500",
    subjects: [
      { text: "Mathematics", bgColor: "bg-orange-100", textColor: "text-orange-800" },
      { text: "History", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
      { text: "English", bgColor: "bg-red-100", textColor: "text-red-800" },
    ],
    duration: "1 hour",
    languages: "English",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
  {
    initials: "MF",
    name: "Maisha Fernando",
    color: "bg-pink-500",
    subjects: [
      { text: "Chemistry", bgColor: "bg-pink-100", textColor: "text-pink-800" },
      { text: "Art", bgColor: "bg-indigo-100", textColor: "text-indigo-800" },
      { text: "Commerce", bgColor: "bg-teal-100", textColor: "text-teal-800" },
    ],
    duration: "1 hour",
    languages: "Sinhala",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
  },
];

export default function SessionHighlights() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Session Highlights – Trending Now
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Join the sessions students are raving about. These expert-led, high-impact sessions are designed
            to help you unlock your full potential whether you&apos;re polishing your resume, mapping out your
            career path, or getting ready to ace technical interviews.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mentors.map((mentor, index) => (
            <div key={index} className="session-card rounded-2xl p-6 shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center mb-4">
                <div
                  className={`w-12 h-12 ${mentor.color} rounded-full flex items-center justify-center mr-4`}
                >
                  <span className="text-white font-bold text-lg">{mentor.initials}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{mentor.name}</h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.subjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 ${subject.bgColor} ${subject.textColor} rounded-full text-xs font-medium`}
                  >
                    {subject.text}
                  </span>
                ))}
              </div>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed">{mentor.description}</p>

              <div className="text-xs text-gray-500 mb-6">
                <div className="mb-1">
                  <strong>Duration:</strong> {mentor.duration}
                </div>
                <div>
                  <strong>Preferred Language:</strong> {mentor.languages}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex-1 mr-3">
                  Book a session
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Add to favorites">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
            Load More Sessions
          </button>
        </div>
      </div>
    </section>
  );
}