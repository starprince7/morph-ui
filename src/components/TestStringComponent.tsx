export const TestStringComponent = `function GeneratedDataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/get-data?endpoint=' + encodeURIComponent('https://app.addomusic.com/api/services'));
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result.data || []);
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-600">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Music Promotion Services
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((service) => (
          <div key={service.id} className="border rounded-lg p-4 shadow-md bg-gray-100 dark:bg-gray-800">
            <img src={service.banner_url} alt={service.service_name} className="w-full h-48 object-cover rounded-md mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{service.service_name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{service.description}</p>
            <p className="text-gray-800 dark:text-gray-300 mb-2">Category: {service.category.name}</p>
            <p className="text-gray-800 dark:text-gray-300 mb-2">Duration: {service.duration_days} days</p>
            <p className="text-blue-600 dark:text-blue-400 font-bold mb-2">Price: $ {service.price}</p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4">
              {service.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`;