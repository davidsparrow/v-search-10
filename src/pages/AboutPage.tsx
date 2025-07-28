import { useNavigate } from 'react-router-dom'

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex flex-col">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-white">V-Search</h1>
            <nav className="flex space-x-6">
              <button 
                onClick={() => navigate('/')}
                className="text-white hover:text-purple-200 transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/search')}
                className="text-white hover:text-purple-200 transition-colors"
              >
                Search
              </button>
              <button 
                onClick={() => navigate('/about')}
                className="text-white hover:text-purple-200 transition-colors"
              >
                About
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">
              About V-Search
            </h2>
            <p className="text-xl text-purple-100">
              Revolutionizing business discovery through visual cloud technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-purple-100 leading-relaxed">
                V-Search transforms how people discover and connect with local businesses. 
                By combining advanced physics simulation with intuitive visual interfaces, 
                we make business discovery not just efficient, but engaging and enjoyable.
              </p>
            </div>

            {/* Technology */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Technology</h3>
              <p className="text-purple-100 leading-relaxed">
                Built with React, TypeScript, and Canvas API, our platform uses 
                real-time physics simulation to create dynamic, interactive business 
                clouds that respond to user interactions and preferences.
              </p>
            </div>

            {/* Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Key Features</h3>
              <ul className="space-y-3 text-purple-100">
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Interactive business cloud visualization
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Real-time physics simulation
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Smart clustering by category
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Advanced search and filtering
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-3">✓</span>
                  Responsive design for all devices
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Business Categories</h3>
              <div className="grid grid-cols-2 gap-3 text-purple-100">
                <div className="flex items-center">
                  <span className="text-purple-300 mr-2">🍽️</span>
                  Catering
                </div>
                <div className="flex items-center">
                  <span className="text-purple-300 mr-2">🎵</span>
                  Entertainment
                </div>
                <div className="flex items-center">
                  <span className="text-purple-300 mr-2">📦</span>
                  Rentals
                </div>
                <div className="flex items-center">
                  <span className="text-purple-300 mr-2">👥</span>
                  Staffing
                </div>
                <div className="flex items-center">
                  <span className="text-purple-300 mr-2">📸</span>
                  Photography
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Get in Touch</h3>
              <p className="text-purple-100 mb-6">
                Ready to discover amazing local businesses? Start your search today!
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Start Searching
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 