import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, FileText, Bell, ChevronRight } from 'lucide-react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import EventCard from '../components/events/EventCard';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch upcoming events
        const eventsQuery = query(
          collection(db, 'events'),
          orderBy('date'),
          limit(3)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUpcomingEvents(eventsData);

        // Fetch announcements
        const announcementsQuery = query(
          collection(db, 'announcements'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const announcementsSnapshot = await getDocs(announcementsQuery);
        const announcementsData = announcementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-md p-6 md:p-8 mb-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome, {currentUser?.displayName || 'Community Member'}!
          </h1>
          <p className="text-primary-100">
            Stay connected with your community and explore the latest updates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Events */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                  Upcoming Events
                </h2>
                <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md h-64"></div>
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      description={event.description}
                      date={event.date.toDate()}
                      location={event.location}
                      imageUrl={event.imageUrl}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-neutral-600">No upcoming events at this time.</p>
                  <Link to="/events/create" className="btn-primary mt-4 inline-block">
                    Create Event
                  </Link>
                </div>
              )}
            </section>

            {/* Community Map */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                  Community Map
                </h2>
                <Link to="/map" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                  Full Map <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-64">
                <div className="h-full w-full bg-neutral-200 flex items-center justify-center">
                  <p className="text-neutral-600">Map preview loading...</p>
                </div>
              </div>
            </section>

            {/* Resources */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary-600" />
                  Recent Resources
                </h2>
                <Link to="/resources" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md h-24"></div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <p className="text-neutral-600 text-center">Resources will appear here.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-8">
            {/* Profile card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold">
                  {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentUser?.displayName || 'User'}</h3>
                  <p className="text-neutral-600 text-sm">{currentUser?.email}</p>
                </div>
              </div>
              <Link to="/profile" className="btn-outline w-full">
                View Profile
              </Link>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 mr-2 text-primary-600" />
                <h3 className="text-lg font-semibold">Announcements</h3>
              </div>
              
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-100 rounded"></div>
                  ))}
                </div>
              ) : announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <p className="text-sm text-neutral-600 line-clamp-2">{announcement.content}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-600 text-center">No announcements at this time.</p>
              )}
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/events/create" 
                    className="text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Create Event</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/resources/upload" 
                    className="text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Upload Resource</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/map/add-location" 
                    className="text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Add Map Location</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;