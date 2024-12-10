import React, { useState, useEffect } from "react";

export default function SearchTeam({ onSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.BASE_URL}/api/search/searchTeams?query=${query}`
      );
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data);
      } else {
        setError(data.message || "Error searching teams");
      }
    } catch (err) {
      setError("Error searching teams");
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelect = (team) => {
    if (selectedTeams.length < 2 && !selectedTeams.includes(team)) {
      const newSelectedTeams = [...selectedTeams, team];
      setSelectedTeams(newSelectedTeams);
      onSelect(newSelectedTeams);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemove = (team) => {
    const newSelectedTeams = selectedTeams.filter((t) => t !== team);
    setSelectedTeams(newSelectedTeams);
    onSelect(newSelectedTeams);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl border w-full text-black">
        {selectedTeams.map((team) => (
          <div key={team} className="flex items-center bg-gray-200 p-1 rounded">
            <span>{team}</span>
            <button
              className="ml-2 text-red-500"
              onClick={() => handleRemove(team)}
            >
              &times;
            </button>
          </div>
        ))}
        {selectedTeams.length < 2 && (
          <input
            type="text"
            placeholder="Search by team"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-2 rounded-xl border-none outline-none"
          />
        )}
      </div>
      {searchResults.length > 0 && searchQuery && (
        <div className="mt-2 bg-white rounded shadow text-black">
          {searchResults.map((result) => (
            <div
              key={result}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelect(result)}
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
