import UniversalNavbar from "@/components/ui/universal-navbar";
import VantaWaves from "@/components/ui/vanta-waves";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Universal Navigation */}
      <UniversalNavbar />

      {/* Vanta Waves Background */}
      <VantaWaves>
        {/* Hero Section */}
        <div className="relative overflow-hidden mt-32">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/30 backdrop-blur-sm mb-8">
                <span className="text-blue-300 text-sm font-medium">
                  🚀 Advanced Inventory Management
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Master Your <span className="text-blue-400">Warehouse</span>
                <br />
                <span className="text-gray-200">Operations</span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Streamline your inventory management with our powerful platform. 
                Track stock levels, manage warehouses, and optimize your supply chain 
                with enterprise-grade precision.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/login">
                  <button className="bg-blue-600/90 hover:bg-blue-700 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 inline-flex items-center shadow-xl hover:shadow-2xl hover:scale-105">
                    Start Managing Inventory
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </Link>
                <button className="border border-gray-400/50 text-gray-200 hover:text-white hover:border-gray-300 hover:bg-white/10 backdrop-blur-sm px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  Watch Demo
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-6 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="bg-blue-600/80 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Real-time Tracking</h3>
                  <p className="text-gray-300">
                    Monitor your inventory levels across all warehouses in real-time with automatic updates and alerts.
                  </p>
                </div>

                <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-6 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="bg-green-600/80 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Analytics & Reports</h3>
                  <p className="text-gray-300">
                    Generate comprehensive reports and gain insights into your inventory performance and trends.
                  </p>
                </div>

                <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-6 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="bg-purple-600/80 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Automated Operations</h3>
                  <p className="text-gray-300">
                    Automate reordering, stock movements, and notifications to optimize your workflow efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VantaWaves>
    </div>
  );
}
