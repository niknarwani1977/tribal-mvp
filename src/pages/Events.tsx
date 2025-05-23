import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { collection, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { format, isAfter, isBefore, startOfDay, endOfDay, addMonths } from 'date-fns';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import EventCard from '../components/events/EventCard';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl?: string;
  category: string;
  organizer: string;
}

const Events = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [showFilters, setShowFilters] = useState(false);

  // Placeholder categories for the filter dropdown
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'cultural', name: 'Cultural Ceremonies' },
    { id: 'educational', name: 'Educational Workshops' },
    { id: 'community', name: 'Community Gatherings' },
    { id: 'arts', name: 'Arts & Crafts' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'youth', name: 'Youth Programs' }
  ];

  const timeFilters = [
    { id: 'upcoming', name: 'Upcoming Events' },
    { id: 'past', name: 'Past Events' },
    { id: 'month', name: 'This Month' },
    { id: 'all', name: 'All Events' }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          orderBy('date')
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        
        if (eventsSnapshot.empty && !loading) {
          setLoading(false);
          return;
        }

        const eventsData = eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date()
          };
        }) as Event[];
        
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    // Apply time filter
    const today = startOfDay(new Date());
    
    if (timeFilter === 'upcoming') {
      filtered = filtered.filter(event => isAfter(event.date, today));
    } else if (timeFilter === 'past') {
      filtered = filtered.filter(event => isBefore(event.date, today));
    } else if (timeFilter === 'month') {
      const endOfMonth = endOfDay(addMonths(today, 1));
      filtered = filtered.filter(event => 
        isAfter(event.date, today) && isBefore(event.date, endOfMonth)
      );
    }
    
    // Sort events - upcoming events by date ascending, past events by date descending
    if (timeFilter === 'past') {
      filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    } else {
      filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    
    setFilteredEvents(filtered);
  }, [searchQuery, selectedCategory, timeFilter, events]);

  // Sample events data if Firebase is empty
  const sampleEvents: Event[] = [
    {
      id: '1',
      title: 'Annual Cultural Festival',
      description: 'Join us for our annual cultural festival celebrating traditional music, dance, food, and art.',
      date: new Date(new Date().setDate(new Date().getDate() + 10)),
      location: 'Tribal Community Center',
      imageUrl: 'https://images.pexels.com/photos/5414061/pexels-photo-5414061.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'cultural',
      organizer: 'Cultural Preservation Committee'
    },
    {
      id: '2',
      title: 'Traditional Crafts Workshop',
      description: 'Learn traditional crafting techniques from tribal elders in this hands-on workshop for all ages.',
      date: new Date(new Date().setDate(new Date().getDate() + 5)),
      location: 'Elders Meeting Hall',
      imageUrl: 'https://images.pexels.com/photos/4926899/pexels-photo-4926899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'arts',
      organizer: 'Arts Council'
    },
    {
      id: '3',
      title: 'Language Preservation Class',
      description: 'Weekly language class focused on preserving and teaching our native language to new generations.',
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      location: 'Community School, Room 102',
      imageUrl: 'https://images.pexels.com/photos/8199562/pexels-photo-8199562.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'educational',
      organizer: 'Language Preservation Society'
    },
    {
      id: '4',
      title: 'Youth Council Meeting',
      description: 'Monthly meeting for youth council members to discuss community initiatives and upcoming projects.',
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      location: 'Community Center, Conference Room A',
      imageUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'youth',
      organizer: 'Youth Leadership Council'
    }
  ];

  const displayEvents = filteredEvents.length > 0 ? filteredEvents : (loading ? [] : sampleEvents);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-secondary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-2">
            <Calendar className="h-8 w-8 mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold">Community Events</h1>
          </div>
          <p className="text-secondary-100 max-w-3xl">
            Stay connected with your community through cultural ceremonies, educational workshops, 
            and gatherings that celebrate and strengthen our tribal traditions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Mobile filters toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-2 border border-neutral-300 rounded-md bg-white"
              >
                <span className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-neutral-500" />
                  <span>Filters</span>
                </span>
                <ChevronDown className={`h-5 w-5 text-neutral-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Desktop filters */}
            <div className="hidden md:grid md:grid-cols-2 md:gap-4">
              {/* Category Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-neutral-400" />
                </div>
                <select
                  className="input pl-10 appearance-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-neutral-400" />
                </div>
                <select
                  className="input pl-10 appearance-none"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  {timeFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Add Event Button */}
            <div className="flex items-center justify-end">
              {currentUser && (
                <Link to="/events/create" className="btn-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Event
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile filters expanded */}
          {showFilters && (
            <div className="md:hidden mt-4 space-y-4 pt-4 border-t border-neutral-200">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  className="input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Time Period
                </label>
                <select
                  className="input"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  {timeFilters.map((filter) => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Events Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md h-80"></div>
              ))}
            </div>
          ) : displayEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={event.date}
                    location={event.location}
                    imageUrl={event.imageUrl}
                  />
                ))}
              </div>
              
              {/* Section with "No events" message based on filters */}
              {events.length > 0 && filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No events match your filters</h3>
                  <p className="text-neutral-600 mb-4">Try adjusting your search or filter criteria</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setTimeFilter('upcoming');
                    }}
                    className="btn-outline"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <Calendar className="h-16 w-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-xl font-medium text-neutral-900 mb-2">No events scheduled</h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                There are no community events scheduled at this time. 
                Check back later or create a new event.
              </p>
              {currentUser && (
                <Link to="/events/create" className="btn-primary">
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Event
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;