import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ size = "w-6 h-6" }) => {
  return (
    <div className="flex items-center justify-center">
      <FaSpinner className={`${size} animate-spin text-primary-600`} />
    </div>
  );
};

export default LoadingSpinner;
