import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { FileText, Search, Filter } from 'lucide-react';
import { db } from '../lib/firebase';
import ResourceCard from '../components/resources/ResourceCard';

interface Resource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  author: {
    name: string;
    photoUrl?: string;
  };
  date: Date;
  tags: string[];
  category: string;
}

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const resourcesQuery = query(
          collection(db, 'resources'),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(resourcesQuery);
        const resourcesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        })) as Resource[];
        
        setResources(resourcesData);
        setFilteredResources(resourcesData);
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    let filtered = resources;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query) || 
        resource.description.toLowerCase().includes(query) ||
        resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }
    
    setFilteredResources(filtered);
  }, [searchQuery, selectedCategory, resources]);

  // Example categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'cultural', name: 'Cultural Heritage' },
    { id: 'educational', name: 'Educational' },
    { id: 'legal', name: 'Legal Documents' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'language', name: 'Language Resources' }
  ];

  // Example resources if database is empty
  const exampleResources: Resource[] = [
    {
      id: '1',
      title: 'Traditional Medicine Guide',
      description: 'A comprehensive guide to traditional medicinal plants and their uses in tribal healing practices.',
      fileUrl: '#',
      fileType: 'pdf',
      author: {
        name: 'Dr. Sarah Johnson',
        photoUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
      },
      date: new Date(),
      tags: ['medicine', 'traditional', 'healing'],
      category: 'health'
    },
    {
      id: '2',
      title: 'Language Learning Workbook',
      description: 'Interactive workbook for learning traditional tribal language with exercises and audio guides.',
      fileUrl: '#',
      fileType: 'pdf',
      author: {
        name: 'Prof. Michael White',
      },
      date: new Date(),
      tags: ['language', 'education', 'culture'],
      category: 'language'
    },
    {
      id: '3',
      title: 'Cultural Preservation Guidelines',
      description: 'Official guidelines for preserving and documenting tribal cultural heritage.',
      fileUrl: '#',
      fileType: 'doc',
      author: {
        name: 'Cultural Heritage Committee',
      },
      date: new Date(),
      tags: ['culture', 'preservation', 'guidelines'],
      category: 'cultural'
    }
  ];

  const displayResources = filteredResources.length > 0 ? filteredResources : (loading ? [] : exampleResources);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-secondary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-2">
            <FileText className="h-8 w-8 mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold">Community Resources</h1>
          </div>
          <p className="text-secondary-100 max-w-3xl">
            Access and share important documents, cultural materials, and educational resources within our community.
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
                placeholder="Search resources..."
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
            
            {/* Upload button */}
            <div className="flex items-center justify-end">
              <button className="btn-primary">
                <FileText className="h-5 w-5 mr-2" />
                Upload Resource
              </button>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-md h-48"></div>
            ))}
          </div>
        ) : displayResources.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {displayResources.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No resources found</h3>
            <p className="text-neutral-600 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Be the first to share a resource with the community'}
            </p>
            <button className="btn-primary">
              Upload Resource
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;