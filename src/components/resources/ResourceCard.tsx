import { FileText, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string; // e.g., 'pdf', 'doc', 'image'
  author: {
    name: string;
    photoUrl?: string;
  };
  date: Date;
  tags?: string[];
}

const ResourceCard = ({
  title,
  description,
  fileUrl,
  fileType,
  author,
  date,
  tags = []
}: ResourceCardProps) => {
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-3 bg-primary-100 rounded-lg">
          <FileText className="h-6 w-6 text-primary-600" />
        </div>
        
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{description}</p>
          
          <div className="flex items-center text-neutral-500 text-sm mb-3">
            <User className="h-4 w-4 mr-1" />
            <span className="mr-4">{author.name}</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>{format(date, 'MMM d, yyyy')}</span>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-block px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary text-sm"
          >
            View {fileType.toUpperCase()}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;