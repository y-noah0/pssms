// Card component for consistent styling
const Card = ({ 
  children, 
  title = null, 
  className = '',
  titleIcon = null 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-50 border-b px-6 py-4 flex items-center">
          {titleIcon && <span className="mr-2">{titleIcon}</span>}
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
