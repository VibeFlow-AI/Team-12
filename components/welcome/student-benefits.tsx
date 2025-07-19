export default function StudentBenefits() {
  return (
    <section className="py-20 bg-gradient-to-b from-cream to-white">
      <style jsx>{`
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">What's in it for Students?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            EduVibe is a student-mentor platform designed to personalize learning journeys. It connects students with mentors who offer guidance, support, and practical industry insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Personalized Learning */}
          <div className="card-hover bg-white rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-4 flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized Learning</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We tailor the mentorship experience to fit each student's unique goals, learning style, and pace making every session impactful.
            </p>
          </div>

          {/* Real Mentors, Real Guidance */}
          <div className="card-hover bg-white rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-xl mb-4 flex items-center justify-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zm4 6v3h-2.5c-.55 0-1 .45-1 1s.45 1 1 1H20v2h-5.5c-1.1 0-2-.9-2-2v-4.5c0-1.1.9-2 2-2H20zm-8 0c1.1 0 2 .9 2 2v4.5c0 1.1-.9 2-2 2H4v-2h5.5c.55 0 1-.45 1-1s-.45-1-1-1H4v-3h8z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real Mentors, Real Guidance</h3>
          </div>

          {/* Growth & Career Readiness */}
          <div className="card-hover bg-white rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
              <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl mb-4 flex items-center justify-center">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Growth & Career Readiness</h3>
          </div>

          {/* Insights-Driven Support */}
          <div className="card-hover bg-white rounded-2xl p-6 shadow-lg">
            <div className="mb-6">
              <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mb-4 flex items-center justify-center">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Insights-Driven Support</h3>
          </div>
        </div>
      </div>
    </section>
  );
}