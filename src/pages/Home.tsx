import { Link } from 'react-router-dom';
import { Calendar, Users, Shield, MapPin, Leaf, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#4F8DFD] to-[#23395D] text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.pexels.com/photos/7282818/pexels-photo-7282818.jpeg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#4F8DFD]/50 to-[#23395D]/50 backdrop-blur-[2px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in">
              Your Trusted Family Circle for Smarter, Safer Scheduling
            </h1>
            <p className="text-xl mb-8 opacity-90 animate-slide-up">
              Bring your village together. Coordinate life, carpools, and activities—all in one secure place. Make family logistics easy, safe, and stress-free by connecting only with people you trust.
            </p>
            <div className="flex flex-wrap gap-4">
              {currentUser ? (
                <Link to="/dashboard" className="btn bg-white text-[#23395D] hover:bg-[#FAFAFA]">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn bg-[#A8E6CF] text-[#23395D] hover:bg-[#98d6bf]">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#23395D] mb-4">
              Simplify Your Family's Daily Journey
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600">
              TribalConnect brings your trusted circle together, making family coordination effortless and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#4F8DFD]/10 text-[#4F8DFD] mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Private Trusted Circles</h3>
              <p className="text-neutral-600">
                Create your secure network of family and trusted friends for seamless coordination.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#A8E6CF]/10 text-[#A8E6CF] mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Family Calendar</h3>
              <p className="text-neutral-600">
                Sync schedules, get real-time traffic updates, and never miss an important event.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FFE066]/10 text-[#FFE066] mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Route Planning</h3>
              <p className="text-neutral-600">
                Organize carpools and coordinate pickups with intelligent route optimization.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#4F8DFD]/10 text-[#4F8DFD] mb-4">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Help When You Need It</h3>
              <p className="text-neutral-600">
                Receive automated assistance offers from your trusted circle when schedules conflict.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#A8E6CF]/10 text-[#A8E6CF] mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-neutral-600">
                End-to-end encryption and granular privacy controls keep your family information secure.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#FFE066]/10 text-[#FFE066] mb-4">
                <Leaf className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Eco Rewards</h3>
              <p className="text-neutral-600">
                Earn points and rewards for eco-friendly carpooling and efficient route sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#4F8DFD]/5 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#23395D] mb-6">
              See How TribalConnect Helps Real Families
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-soft mb-6">
              <p className="text-lg text-neutral-600 italic">
                "As a working mom with three kids in different activities, TribalConnect has been a game-changer. 
                I can coordinate with other parents in my trusted circle for pickups and drop-offs, 
                and the automated help offers when schedules conflict have saved us so many times!"
              </p>
              <div className="mt-4">
                <p className="font-semibold text-[#23395D]">Sarah Johnson</p>
                <p className="text-sm text-neutral-500">Mother of three, Boston MA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#23395D] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Simplify Your Family Life?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust TribalConnect to make their daily coordination easier and safer.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn bg-[#A8E6CF] text-[#23395D] hover:bg-[#98d6bf]">
              Start Your Circle
            </Link>
            <Link to="/login" className="btn bg-transparent border border-white text-white hover:bg-white/10">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;