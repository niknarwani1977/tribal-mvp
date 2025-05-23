import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  imageUrl?: string;
}

const EventCard = ({ id, title, description, date, location, imageUrl }: EventCardProps) => {
  return (
    <div className="card card-hover">
      {imageUrl && (
        <div className="h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <div className="p-5">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{title}</h3>
        
        <div className="flex items-center text-neutral-600 text-sm mb-1">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{format(date, 'MMMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center text-neutral-600 text-sm mb-1">
          <Clock className="h-4 w-4 mr-2" />
          <span>{format(date, 'h:mm a')}</span>
        </div>
        
        <div className="flex items-center text-neutral-600 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="line-clamp-1">{location}</span>
        </div>
        
        <p className="text-neutral-700 mb-4 line-clamp-2">{description}</p>
        
        <Link to={`/events/${id}`} className="btn-outline text-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;