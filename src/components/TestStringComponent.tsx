export const TestStringComponent = `
function GeneratedDataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.starprince.dev/api/vehicle/listing');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No vehicles available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Vehicle Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((vehicle) => (
          <div key={vehicle.id} className="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800">
            <img
              src={vehicle.images && vehicle.images[0] ? vehicle.images[0] : '/placeholder-car.jpg'}
              alt={\`\${vehicle.make} \${vehicle.model}\`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-car.jpg';
              }}
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Price per day: <span className="font-bold">$\{vehicle.rentalPricePerDay}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Location: {vehicle.location?.city}, {vehicle.location?.country}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Rating: {vehicle.rating} stars ({vehicle.reviewCount} reviews)
              </p>
              <button className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;