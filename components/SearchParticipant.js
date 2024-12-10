import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SearchParticipant({ initialParticipants }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(initialParticipants);
  const [mealType, setMealType] = useState(null);
  const [error, setError] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [mealClaimed, setMealClaimed] = useState(false);

  const handleValueChange = (value) => {
    setMealType(value);
    console.log(value);
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/search/searchParticipants?query=${query}`)
      const data = await response.json();
      if (response.ok) {
        const uniqueResults = Array.from(
          new Set(data.map((item) => item.participantId))
        ).map((id) => data.find((item) => item.participantId === id));
        setSearchResults(uniqueResults);
      } else {
        setError(data.message || "Error searching participants");
      }
    } catch (err) {
      setError("Error searching participants");
    }
  };

  const handleClaimMeal = async (participant) => {
    if (!mealType) {
      setError("Please select a meal type");
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/meals/claimMeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant, mealType }),
      });
      const data = await response.json();
      if (response.ok) {
        setError(""); 
        setMealClaimed(true);
        alert(`${mealType} claimed successfully for ${participant.name}`);
      } else {
        setError(data.message || "Error claiming meal");
        if (data.message.includes("already claimed")) {
          setMealClaimed(true);
        }
      }
    } catch (err) {
      setError("Error claiming meal");
    }
  };

  const handleResetMealClaim = async (participant) => {
    try {
      const response = await fetch('http://localhost:3000/api/meals/resetMealClaim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant, mealType }),
      });
      const data = await response.json();
      if (response.ok) {
        setError("");
        setMealClaimed(false);
        alert(`Meal claim reset successfully for ${participant.name}`);
      } else {
        setError(data.message || "Error resetting meal claim");
      }
    } catch (err) {
      setError("Error resetting meal claim");
    }
  };

  const checkMealClaimStatus = async (participant, mealType) => {
    try {
      const response = await fetch(`http://localhost:3000/api/meals/checkMealClaim?participantId=${participant.participantId}&mealType=${mealType}`);
      const data = await response.json();
      if (response.ok) {
        setMealClaimed(data.claimed);
      } else {
        setMealClaimed(false);
      }
    } catch (err) {
      setMealClaimed(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedParticipant && mealType) {
      checkMealClaimStatus(selectedParticipant, mealType);
    }
  }, [selectedParticipant, mealType]);

  return (
    <div className="w-full flex flex-col items-center px-4 py-2 bg-black">
      <div className="w-full max-w-md shadow-md rounded-2xl overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl font-bold text-center mb-4 text-white">
            Search Participant
          </h2>
          <div className=" text-black">
            <input
              type="text"
              placeholder="Search by name, team, or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 rounded-2xl border w-full"
            />
            {searchResults.length > 0 && searchQuery && (
              <div className="mt-2 bg-white rounded shadow">
                {searchResults.map((result) => (
                  <div
                    key={result.participantId}
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setSelectedParticipant(result);
                      setSearchQuery("");
                    }}
                  >
                    {result.name} - {result.teamName} - {result.mailId}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedParticipant && (
            <div className="mt-4 p-3 bg-gray-100 text-black relative rounded-2xl">
              <button
                className="absolute top-2 right-2 text-red-500 text-2xl"
                onClick={() => setSelectedParticipant(null)}
              >
                X
              </button>
              <p className="font-semibold mb-2">Selected Participant:</p>
              <div className="space-y-2">
                <div className="p-2 bg-white rounded shadow">
                  <p className="break-words text-sm">
                    {selectedParticipant.name} - {selectedParticipant.teamName}{" "}
                    - {selectedParticipant.mailId}
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        className="rounded-xl mt-2 w-full"
                      >
                        {mealType ? mealType : "Select Meal Type"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className=" bg-black text-white">
                      <DropdownMenuRadioGroup
                        value={mealType}
                        onValueChange={handleValueChange}
                      >
                        <DropdownMenuRadioItem value="Breakfast">
                          Breakfast
                        </DropdownMenuRadioItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioItem value="Lunch">
                          Lunch
                        </DropdownMenuRadioItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioItem value="Dinner">
                          Dinner
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    onClick={() => handleClaimMeal(selectedParticipant)}
                    className="mt-2 w-full"
                  >
                    Claim {mealType}
                  </Button>
                  {mealClaimed && (
                    <Button
                      onClick={() => handleResetMealClaim(selectedParticipant)}
                      className="mt-2 w-full"
                      variant="destructive"
                    >
                      Reset Meal Claim
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center mt-4">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
