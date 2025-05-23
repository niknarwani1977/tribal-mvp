import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import MapComponent from '../components/map/MapComponent';
import { MapPin, Filter, Search } from 'lucide-react';

interface MapPoint {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description: string;
  category: string;
}

const CommunityMap = () => {
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPoints, setFilteredPoints] = useState<MapPoint[]>([]);

  useEffect(() => {
    const fetchMapPoints = async () => {
      try {
        const pointsSnapshot = await getDocs(collection(db, 'mapPoints'));
        const points = pointsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MapPoint[];
        
        setMapPoints(points);
        setFilteredPoints(points);
      } catch (error) {
        console.error('Error fetching map points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapPoints();
  }, []);

  useEffect(() => {
    // Filter the map points based on search query and selected category
    let filtered = mapPoints;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(point => 
        point.title.toLowerCase().includes(query) || 
        point.description.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(point => point.category === selectedCategory);
    }
    
    setFilteredPoints(filtered);
  }, [searchQuery, selectedCategory, mapPoints]);

  // Placeholder categories for the filter dropdown
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'cultural', name: 'Cultural Sites' },
    { id: 'community', name: 'Community Centers' },
    { id: 'historical', name: 'Historical Landmarks' },
    { id: 'services', name: 'Services' },
    { id: 'education', name: 'Educational' }
  ];

  // Example map points if database is empty
  const exampleMapPoints: MapPoint[] = [
    {
      id: '1',
      position: { lat: 40.7128, lng: -74.006 },
      title: 'Tribal Cultural Center',
      description: 'Main community gathering place for cultural events and activities.',
      category: 'cultural'
    },
    {
      id: '2',
      position: { lat: 40.7200, lng: -73.9950 },
      title: 'Heritage Museum',
      description: 'Museum preserving tribal artifacts and history.',
      category: 'historical'
    },
    {
      id: '3',
      position: { lat: 40.7050, lng: -74.0100 },
      title: 'Community School',
      description: 'Educational facility teaching traditional knowledge and modern curriculum.',
      category: 'education'
    }
  ];

  const displayPoints = filteredPoints.length > 0 ? filteredPoints : (loading ? [] : exampleMapPoints);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-2">
            <MapPin className="h-8 w-8 mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold">Community Map</h1>
          </div>
          <p className="text-primary-100 max-w-3xl">
            Explore important cultural sites, community resources, and points of interest within our tribal lands.
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
                placeholder="Search locations..."
                className="input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
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
            
            {/* Add Location button */}
            <div className="flex items-center justify-end">
              <button className="btn-primary">
                <MapPin className="h-5 w-5 mr-2" />
                Add Location
              </button>
            </div>
          </div>
        </div>
        
        {/* Map */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <MapComponent 
            points={displayPoints}
            height="600px"
            initialCenter={displayPoints.length > 0 ? displayPoints[0].position : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default CommunityMap;