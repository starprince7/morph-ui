export const TestStringComponent = `
function GeneratedDataComponent() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(
          '/api/get-data?endpoint=' + encodeURIComponent('https://api.github.com/users/octocat/repos')
        );
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const result = await response.json();
        setRepos(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">Loading repositories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded max-w-md mx-auto mt-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded max-w-md mx-auto mt-8">
        <p className="text-gray-600">No repositories found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Octocat's Repositories</h1>
      <ul className="space-y-4">
        {repos.map((repo) => (
          <li key={repo.id} className="border rounded p-4 bg-white shadow hover:shadow-md transition">
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="block">
              <h2 className="text-xl font-semibold text-blue-600">{repo.name}</h2>
              <p className="text-gray-700 mt-1">{repo.description || 'No description available'}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500 mr-4">Stars: {repo.stargazers_count}</span>
                <span className="text-sm text-gray-500">Forks: {repo.forks_count}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;