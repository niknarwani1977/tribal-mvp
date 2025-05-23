import { MapPin } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = 'h-6 w-6' }: LogoProps) => {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <MapPin className="absolute text-primary-600" />
      <span className="absolute h-2 w-2 bg-accent-500 rounded-full transform translate-x-[1px] translate-y-[-2px]"></span>
    </div>
  );
};

export default Logo;