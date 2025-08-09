export const TestStringComponent = `function GeneratedDataComponent() {
  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ratingDesc');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Fetch data using the required proxy route and pattern
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await fetch('/api/get-data?endpoint=' + encodeURIComponent('https://api.starprince.dev/api/vehicle/listing'));
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        const payload = result && result.data !== undefined ? result.data : result;
        setData(payload);
        setMetadata(result && result.metadata ? result.metadata : null);
      } catch (err) {
        setError(err && err.message ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = function(e) {
      if (e.key === 'Escape') {
        setSelectedVehicle(null);
      }
    };
    if (selectedVehicle) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return function cleanup() {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedVehicle]);

  // Normalize list structure in case API returns a wrapped object
  const vehicles = Array.isArray(data)
    ? data
    : (data && Array.isArray(data.items) ? data.items
      : (data && Array.isArray(data.results) ? data.results : []));

  // Build vehicle type options from data
  const availableTypes = (function() {
    const typesSet = {};
    for (let i = 0; i < vehicles.length; i++) {
      const t = vehicles[i] && vehicles[i].vehicleType ? String(vehicles[i].vehicleType) : '';
      if (t) {
        typesSet[t] = true;
      }
    }
    return Object.keys(typesSet);
  })();

  const filteredSorted = (function() {
    const q = query.trim().toLowerCase();
    const arr = [];
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i] || {};
      // Availability filter
      if (availabilityFilter === 'available' && !(v.availability === true || v.vehicleStatus === 'available')) {
        continue;
      }
      if (availabilityFilter === 'unavailable' && (v.availability === true || v.vehicleStatus === 'available')) {
        continue;
      }
      // Type filter
      if (typeFilter !== 'all') {
        if (!v.vehicleType || String(v.vehicleType).toLowerCase() !== String(typeFilter).toLowerCase()) {
          continue;
        }
      }
      // Search query over make, model, location.city, description
      if (q.length > 0) {
        const make = v.make ? String(v.make).toLowerCase() : '';
        const model = v.model ? String(v.model).toLowerCase() : '';
        const city = v.location && v.location.city ? String(v.location.city).toLowerCase() : '';
        const desc = v.description ? String(v.description).toLowerCase() : '';
        const combined = make + ' ' + model + ' ' + city + ' ' + desc;
        if (combined.indexOf(q) === -1) {
          continue;
        }
      }
      arr.push(v);
    }

    // Sorting
    arr.sort(function(a, b) {
      const priceA = a && a.rentalPricePerDay ? Number(a.rentalPricePerDay) : 0;
      const priceB = b && b.rentalPricePerDay ? Number(b.rentalPricePerDay) : 0;
      const ratingA = a && a.rating ? Number(a.rating) : 0;
      const ratingB = b && b.rating ? Number(b.rating) : 0;

      if (sortBy === 'priceAsc') {
        return priceA - priceB;
      }
      if (sortBy === 'priceDesc') {
        return priceB - priceA;
      }
      if (sortBy === 'ratingAsc') {
        return ratingA - ratingB;
      }
      // Default ratingDesc (recommended)
      return ratingB - ratingA;
    });

    return arr;
  })();

  // UI helpers
  const formatPricePerDay = function(value) {
    const num = typeof value === 'number' ? value : Number(value || 0);
    return num.toLocaleString();
  };

  const formatLocation = function(loc) {
    if (!loc) return 'Location: N/A';
    const city = loc.city ? String(loc.city) : '';
    const country = loc.country ? String(loc.country) : '';
    if (city && country) return city + ', ' + country;
    return city || country || 'Location: N/A';
  };

  const getAvailabilityStatus = function(item) {
    // Prefer explicit availability boolean; fallback to vehicleStatus
    if (item && item.availability === true) return 'available';
    if (item && item.availability === false) return 'unavailable';
    const vs = item && item.vehicleStatus ? String(item.vehicleStatus).toLowerCase() : '';
    if (vs === 'available') return 'available';
    if (vs === 'maintenance' || vs === 'unavailable' || vs === 'booked') return 'unavailable';
    return 'unknown';
  };

  const handleRetry = function() {
    // Simple retry: reset and refetch by re-running the effect logic inline
    setLoading(true);
    setError(null);
    (async function() {
      try {
        const response = await fetch('/api/get-data?endpoint=' + encodeURIComponent('https://api.starprince.dev/api/vehicle/listing'));
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        const payload = result && result.data !== undefined ? result.data : result;
        setData(payload);
        setMetadata(result && result.metadata ? result.metadata : null);
      } catch (err) {
        setError(err && err.message ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    })();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#10002B] flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#240046]/30 border-t-[#C77DFF] mb-4"></div>
        <p className="text-lg font-medium text-[#C77DFF]">Loading vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#10002B] flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-[#240046] rounded-xl shadow-md border border-[#C77DFF]/20 p-6">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mr-4 shadow-md" aria-hidden="true">
              <span className="text-white font-bold">!</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-normal text-[#E0AAFF] mb-1">Something went wrong</h2>
              <p className="text-[#C77DFF] mb-4">Error: {error}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRetry}
                  className="bg-[#C77DFF] hover:bg-[#9D4EDD] text-[#10002B] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none"
                >
                  Retry
                </button>
                <button
                  onClick={function(){ window.location.reload(); }}
                  className="border-2 border-[#C77DFF] text-[#C77DFF] hover:bg-[#C77DFF] hover:text-[#10002B] rounded-full px-6 py-3 font-medium transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
          {metadata ? (
            <div className="mt-4 p-3 rounded-lg bg-[#240046] border border-[#C77DFF]/20">
              <p className="text-sm text-[#C77DFF]">Source: {metadata.source ? String(metadata.source) : 'Unknown'}</p>
              <p className="text-sm text-[#C77DFF]">Timestamp: {metadata.timestamp ? String(metadata.timestamp) : 'N/A'}</p>
              <p className="text-sm text-[#C77DFF]">Status: {metadata.status ? String(metadata.status) : 'N/A'}</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10002B]">
      <header className="sticky top-0 z-30 bg-[#10002B]/90 backdrop-blur-sm border-b border-[#240046]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-normal text-[#E0AAFF] tracking-tight">Vehicle Listings</h1>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-[#C77DFF]">Powered by</span>
            <span className="px-3 py-1 rounded-full bg-[#3C096C] text-[#E0AAFF] text-sm border border-[#C77DFF]/30">StarPrince API</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <section className="bg-[#240046] rounded-xl shadow-md border border-[#C77DFF]/20 p-4 md:p-6 hover:bg-[#3C096C] hover:shadow-lg transition-all duration-200">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-[#C77DFF] mb-2">Search</label>
              <input
                id="search"
                type="text"
                value={query}
                onChange={function(e){ setQuery(e.target.value); }}
                placeholder="Search make, model, city..."
                className="w-full bg-[#240046] border-2 border-[#C77DFF]/30 text-[#E0AAFF] placeholder-[#C77DFF]/70 focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/20 focus:bg-[#3C096C] rounded-lg px-4 py-3"
                aria-label="Search vehicles by make, model, or city"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-[#C77DFF] mb-2">Vehicle Type</label>
                <select
                  id="type"
                  value={typeFilter}
                  onChange={function(e){ setTypeFilter(e.target.value); }}
                  className="w-full bg-[#240046] border-2 border-[#C77DFF]/30 text-[#E0AAFF] focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/20 focus:bg-[#3C096C] rounded-lg px-4 py-3"
                >
                  <option value="all">All types</option>
                  {availableTypes.map(function(t){ return (
                    <option key={t} value={t}>{t}</option>
                  ); })}
                </select>
              </div>
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-[#C77DFF] mb-2">Availability</label>
                <select
                  id="availability"
                  value={availabilityFilter}
                  onChange={function(e){ setAvailabilityFilter(e.target.value); }}
                  className="w-full bg-[#240046] border-2 border-[#C77DFF]/30 text-[#E0AAFF] focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/20 focus:bg-[#3C096C] rounded-lg px-4 py-3"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-[#C77DFF] mb-2">Sort By</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={function(e){ setSortBy(e.target.value); }}
                  className="w-full bg-[#240046] border-2 border-[#C77DFF]/30 text-[#E0AAFF] focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/20 focus:bg-[#3C096C] rounded-lg px-4 py-3"
                >
                  <option value="ratingDesc">Rating: High to Low</option>
                  <option value="ratingAsc">Rating: Low to High</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
          {metadata ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="text-xs md:text-sm text-[#C77DFF]">Source: {metadata.source ? String(metadata.source) : 'Unknown'}</span>
              <span className="text-xs md:text-sm text-[#C77DFF]">Fetched: {metadata.timestamp ? String(metadata.timestamp) : 'N/A'}</span>
              <span className="text-xs md:text-sm text-[#C77DFF]">Status: {metadata.status ? String(metadata.status) : 'N/A'}</span>
            </div>
          ) : null}
        </section>

        {filteredSorted.length === 0 ? (
          <section className="mt-6">
            <div className="bg-[#240046] rounded-xl shadow-md border border-[#C77DFF]/20 p-8 text-center hover:bg-[#3C096C] hover:shadow-lg transition-all duration-200">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#C77DFF]/20 border border-[#C77DFF]/30 flex items-center justify-center mb-4">
                <span className="text-[#C77DFF] text-xl" aria-hidden="true">∅</span>
              </div>
              <h3 className="text-2xl font-normal text-[#E0AAFF] mb-2">No vehicles found</h3>
              <p className="text-[#C77DFF] mb-6">Try adjusting your search or filters to find available vehicles.</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={function(){ setQuery(''); setAvailabilityFilter('all'); setTypeFilter('all'); setSortBy('ratingDesc'); }}
                  className="bg-[#C77DFF] hover:bg-[#9D4EDD] text-[#10002B] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none"
                >
                  Reset Filters
                </button>
                <button
                  onClick={handleRetry}
                  className="border-2 border-[#C77DFF] text-[#C77DFF] hover:bg-[#C77DFF] hover:text-[#10002B] rounded-full px-6 py-3 font-medium transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none"
                >
                  Reload Data
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSorted.map(function(item) {
                const title = (item && item.year ? String(item.year) + ' ' : '') + (item && item.make ? String(item.make) + ' ' : '') + (item && item.model ? String(item.model) : '');
                const price = item && item.rentalPricePerDay !== undefined ? item.rentalPricePerDay : null;
                const loc = item && item.location ? item.location : null;
                const status = getAvailabilityStatus(item);
                const imageUrl = item && item.images && item.images.length > 0 ? String(item.images[0]) : '';
                const rating = item && item.rating ? Number(item.rating) : 0;
                const reviewCount = item && item.reviewCount ? Number(item.reviewCount) : 0;
                const isAvailable = status === 'available';

                return (
                  <article
                    key={(item && item.id) ? String(item.id) : title + Math.random().toString()}
                    className="bg-[#240046] hover:bg-[#3C096C] rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border border-[#C77DFF]/20 overflow-hidden flex flex-col"
                  >
                    <div className="w-full h-48 bg-[#10002B] overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title ? title : 'Vehicle image'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={function(e){ e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[#C77DFF]">No image available</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg md:text-xl font-medium text-[#E0AAFF]">{title || 'Vehicle'}</h3>
                        <div className={isAvailable ? 'px-2 py-1 rounded-full text-xs bg-green-600/20 text-green-300 border border-green-600/30 shrink-0' : (status === 'unavailable' ? 'px-2 py-1 rounded-full text-xs bg-yellow-600/20 text-yellow-300 border border-yellow-600/30 shrink-0' : 'px-2 py-1 rounded-full text-xs bg-[#C77DFF]/20 text-[#C77DFF] border border-[#C77DFF]/30 shrink-0')}>
                          {isAvailable ? 'Available' : (status === 'unavailable' ? 'Unavailable' : 'Status: Unknown')}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-sm text-[#C77DFF]">
                        <span aria-hidden="true">📍</span>
                        <span className="truncate max-w-full">{formatLocation(loc)}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center" aria-label="Rating">
                            <span className="text-[#E0AAFF]">{rating.toFixed(1)}</span>
                            <span className="ml-1 text-[#C77DFF]" aria-hidden="true">★</span>
                          </div>
                          <span className="text-xs text-[#C77DFF]">({reviewCount} reviews)</span>
                        </div>
                        <div className="text-right">
                          {price !== null ? (
                            <p className="text-lg md:text-xl font-medium text-[#E0AAFF]"> {'$'}{formatPricePerDay(price)} <span className="text-sm text-[#C77DFF]">/ day</span></p>
                          ) : (
                            <p className="text-sm text-[#C77DFF]">Price not available</p>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-[#C77DFF] overflow-hidden text-ellipsis">
                        {item && item.description ? item.description : 'No description provided.'}
                      </p>

                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        {item && item.fuelType ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-[#3C096C] text-[#E0AAFF] border border-[#C77DFF]/30">Fuel: {String(item.fuelType)}</span>
                        ) : null}
                        {item && item.transmission ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-[#3C096C] text-[#E0AAFF] border border-[#C77DFF]/30">Trans: {String(item.transmission)}</span>
                        ) : null}
                        {item && item.seatingCapacity ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-[#3C096C] text-[#E0AAFF] border border-[#C77DFF]/30">Seats: {String(item.seatingCapacity)}</span>
                        ) : null}
                        {item && item.vehicleType ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-[#3C096C] text-[#E0AAFF] border border-[#C77DFF]/30">Type: {String(item.vehicleType)}</span>
                        ) : null}
                      </div>

                      <div className="mt-5 flex items-center gap-3 flex-wrap">
                        <button
                          onClick={function(){ setSelectedVehicle(item); }}
                          className="bg-[#C77DFF] hover:bg-[#9D4EDD] text-[#10002B] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none"
                          aria-label={'View details for ' + title}
                        >
                          View Details
                        </button>
                        <button
                          onClick={function(){ setSelectedVehicle(item); }}
                          className={isAvailable ? 'bg-[#9D4EDD] hover:bg-[#7B2CBF] text-[#E0AAFF] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none' : 'opacity-50 cursor-not-allowed bg-[#240046]/50 text-[#C77DFF]/50 rounded-full px-6 py-3 font-medium'}
                          disabled={!isAvailable}
                          aria-disabled={!isAvailable}
                          aria-label={isAvailable ? 'Start booking for ' + title : 'Booking disabled'}
                        >
                          {isAvailable ? 'Book Now' : 'Not Available'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {selectedVehicle ? (
        <div
          className="fixed inset-0 z-50 bg-[#10002B]/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle details"
          onClick={function(e){ if (e.target === e.currentTarget) { setSelectedVehicle(null); } }}
        >
          <div className="w-full max-w-3xl bg-[#240046] rounded-2xl shadow-2xl border border-[#C77DFF]/30 overflow-hidden transform transition-transform">
            <div className="relative">
              <div className="w-full h-56 sm:h-72 bg-[#10002B] overflow-hidden">
                {selectedVehicle && selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                  <img
                    src={String(selectedVehicle.images[0])}
                    alt={(selectedVehicle.year ? String(selectedVehicle.year) + ' ' : '') + (selectedVehicle.make ? String(selectedVehicle.make) + ' ' : '') + (selectedVehicle.model ? String(selectedVehicle.model) : '')}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#C77DFF]">No image available</span>
                  </div>
                )}
              </div>
              <button
                onClick={function(){ setSelectedVehicle(null); }}
                className="absolute top-3 right-3 bg-[#9D4EDD] hover:bg-[#7B2CBF] text-[#E0AAFF] rounded-full px-4 py-2 font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none"
                aria-label="Close details"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-normal text-[#E0AAFF]">
                    {(selectedVehicle.year ? String(selectedVehicle.year) + ' ' : '') + (selectedVehicle.make ? String(selectedVehicle.make) + ' ' : '') + (selectedVehicle.model ? String(selectedVehicle.model) : '')}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-[#C77DFF]">
                    <div className="flex items-center">
                      <span className="text-[#E0AAFF]">{selectedVehicle && selectedVehicle.rating ? Number(selectedVehicle.rating).toFixed(1) : '0.0'}</span>
                      <span className="ml-1 text-[#C77DFF]" aria-hidden="true">★</span>
                    </div>
                    <span className="text-sm">({selectedVehicle && selectedVehicle.reviewCount ? String(selectedVehicle.reviewCount) : '0'} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  {selectedVehicle && selectedVehicle.rentalPricePerDay !== undefined ? (
                    <p className="text-xl font-medium text-[#E0AAFF]"> {'$'}{formatPricePerDay(selectedVehicle.rentalPricePerDay)} <span className="text-sm text-[#C77DFF]">/ day</span></p>
                  ) : (
                    <p className="text-sm text-[#C77DFF]">Price not available</p>
                  )}
                  <div className="mt-2">
                    <span className={getAvailabilityStatus(selectedVehicle) === 'available' ? 'px-3 py-1 rounded-full text-xs bg-green-600/20 text-green-300 border border-green-600/30' : (getAvailabilityStatus(selectedVehicle) === 'unavailable' ? 'px-3 py-1 rounded-full text-xs bg-yellow-600/20 text-yellow-300 border border-yellow-600/30' : 'px-3 py-1 rounded-full text-xs bg-[#C77DFF]/20 text-[#C77DFF] border border-[#C77DFF]/30')}>
                      {getAvailabilityStatus(selectedVehicle) === 'available' ? 'Available' : (getAvailabilityStatus(selectedVehicle) === 'unavailable' ? 'Unavailable' : 'Status: Unknown')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[#C77DFF]">{selectedVehicle && selectedVehicle.description ? String(selectedVehicle.description) : 'No description provided.'}</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#240046] rounded-xl border border-[#C77DFF]/20 p-4">
                  <h4 className="text-lg font-medium text-[#E0AAFF] mb-3">Quick Specs</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-[#C77DFF]">
                    <div>
                      <span className="block text-[#C77DFF]">Fuel</span>
                      <span className="text-[#E0AAFF]">{selectedVehicle && selectedVehicle.fuelType ? String(selectedVehicle.fuelType) : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[#C77DFF]">Transmission</span>
                      <span className="text-[#E0AAFF]">{selectedVehicle && selectedVehicle.transmission ? String(selectedVehicle.transmission) : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[#C77DFF]">Seats</span>
                      <span className="text-[#E0AAFF]">{selectedVehicle && selectedVehicle.seatingCapacity ? String(selectedVehicle.seatingCapacity) : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-[#C77DFF]">Mileage</span>
                      <span className="text-[#E0AAFF]">{selectedVehicle && selectedVehicle.mileage !== undefined ? String(selectedVehicle.mileage) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#240046] rounded-xl border border-[#C77DFF]/20 p-4">
                  <h4 className="text-lg font-medium text-[#E0AAFF] mb-3">Owner</h4>
                  <div className="text-sm">
                    <p className="text-[#E0AAFF]">{selectedVehicle && selectedVehicle.owner && selectedVehicle.owner.name ? String(selectedVehicle.owner.name) : 'N/A'}</p>
                    <p className="text-[#C77DFF]">{selectedVehicle && selectedVehicle.owner && selectedVehicle.owner.contact ? String(selectedVehicle.owner.contact) : 'Contact not available'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#240046] rounded-xl border border-[#C77DFF]/20 p-4">
                  <h4 className="text-lg font-medium text-[#E0AAFF] mb-3">Advanced Features</h4>
                  <div className="flex flex-wrap gap-2 max-w-full">
                    {selectedVehicle && Array.isArray(selectedVehicle.advancedFeatures) && selectedVehicle.advancedFeatures.length > 0 ? (
                      selectedVehicle.advancedFeatures.map(function(f, idx) {
                        const isOn = f && (f.value === true || String(f.value).toLowerCase() === 'true');
                        return (
                          <span
                            key={'feat-' + String(idx)}
                            className={isOn ? 'px-3 py-1 rounded-full text-xs bg-[#3C096C] text-[#E0AAFF] border border-[#C77DFF]/30' : 'px-3 py-1 rounded-full text-xs bg-[#240046] text-[#C77DFF] border border-[#C77DFF]/20 opacity-80'}
                          >
                            {f && f.label ? String(f.label) : 'Feature'}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-[#C77DFF]">No advanced features listed.</span>
                    )}
                  </div>
                </div>

                <div className="bg-[#240046] rounded-xl border border-[#C77DFF]/20 p-4">
                  <h4 className="text-lg font-medium text-[#E0AAFF] mb-3">Additional Fees</h4>
                  <div className="flex flex-col gap-2 max-w-full">
                    {selectedVehicle && Array.isArray(selectedVehicle.additionalFees) && selectedVehicle.additionalFees.length > 0 ? (
                      selectedVehicle.additionalFees.map(function(fee, idx) {
                        return (
                          <div key={'fee-' + String(idx)} className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[#E0AAFF] text-sm">{fee && fee.name ? String(fee.name) : 'Fee'}</p>
                              <p className="text-[#C77DFF] text-xs truncate max-w-full">{fee && fee.description ? String(fee.description) : ''}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[#E0AAFF] text-sm">{fee && fee.amount !== undefined ? ('{' + '$' + '}') : ''}{fee && fee.amount !== undefined ? String(fee.amount) : ''}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-sm text-[#C77DFF]">No additional fees</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-[#C77DFF]">
                  <span aria-hidden="true">📍</span>
                  <span>{selectedVehicle && selectedVehicle.location ? formatLocation(selectedVehicle.location) : 'Location: N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={function(){ setSelectedVehicle(null); }}
                    className="border-2 border-[#C77DFF] text-[#C77DFF] hover:bg-[#C77DFF] hover:text-[#10002B] rounded-full px-6 py-3 font-medium transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none"
                  >
                    Close
                  </button>
                  <button
                    disabled={getAvailabilityStatus(selectedVehicle) !== 'available'}
                    aria-disabled={getAvailabilityStatus(selectedVehicle) !== 'available'}
                    onClick={function(){ /* Booking flow placeholder */ }}
                    className={getAvailabilityStatus(selectedVehicle) === 'available' ? 'bg-[#C77DFF] hover:bg-[#9D4EDD] text-[#10002B] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none' : 'opacity-50 cursor-not-allowed bg-[#240046]/50 text-[#C77DFF]/50 rounded-full px-6 py-3 font-medium'}
                  >
                    {getAvailabilityStatus(selectedVehicle) === 'available' ? 'Proceed to Book' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="mt-8 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#240046] rounded-xl shadow-md border border-[#C77DFF]/20 p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#C77DFF]">Showing {String(filteredSorted.length)} of {String(vehicles.length)} vehicles</p>
            <div className="flex items-center gap-2">
              <button
                onClick={function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="bg-[#9D4EDD] hover:bg-[#7B2CBF] text-[#E0AAFF] rounded-full px-6 py-3 font-medium shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-[#C77DFF]/40 focus:outline-none"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}`;