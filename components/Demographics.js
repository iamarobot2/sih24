"use client";

import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Bar } from "react-chartjs-2";
import SearchTeam from "./SearchTeam";

export default function Demographics() {
  const [data, setData] = useState([]);
  const [mealType, setMealType] = useState("All");
  const [team, setTeam] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [role, setRole] = useState("All");
  const [counts, setCounts] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [unclaimedParticipants, setUnclaimedParticipants] = useState(0);
  const [unclaimedStudents, setUnclaimedStudents] = useState(0);
  const [unclaimedMentors, setUnclaimedMentors] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/demographics?mealType=${mealType}&team=${team.join(",")}&date=${date}&role=${role}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      if (response.ok) {
        setData(result.claimsData);
        setCounts({
          breakfast: result.claimsData.filter((item) => item.mealType === "Breakfast").length,
          lunch: result.claimsData.filter((item) => item.mealType === "Lunch").length,
          dinner: result.claimsData.filter((item) => item.mealType === "Dinner").length,
        });
        setTotalParticipants(result.totalParticipants);
        setUnclaimedParticipants(result.unclaimedParticipants);
        setUnclaimedStudents(result.unclaimedStudents);
        setUnclaimedMentors(result.unclaimedMentors);
      } else {
        console.error("Error fetching demographics data");
      }
    } catch (error) {
      console.error("Error fetching demographics data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [mealType, team, date, role]);

  return (
    <div className="flex flex-col items-center p-4 bg-black text-white">
      <h2 className="text-xl font-bold mb-4">Demographics</h2>
      <div className="w-full max-w-md">
        <div className="flex flex-col mb-4">
          <label className="text-white">Meal Type</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-xl">
                {mealType ? mealType : "Select Meal Type"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black text-white">
              <DropdownMenuRadioGroup value={mealType} onValueChange={setMealType}>
                <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="Breakfast">Breakfast</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="Lunch">Lunch</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="Dinner">Dinner</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <label className="text-white">Role</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="rounded-xl">
                {role ? role : "Select Role"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black text-white">
              <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="Student">Student</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                <DropdownMenuRadioItem value="Mentor">Mentor</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <label className="text-white">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 rounded-xl border w-full text-black"
          />
          <label className="text-white">Team</label>
          <SearchTeam onSelect={(selectedTeams) => setTeam(selectedTeams)} />
        </div>
        {mealType !== "All" && (
          <div className="p-4 bg-gray-800 rounded-lg mb-4">
            <h3 className="text-lg font-semibold">Unclaimed Meals</h3>
            <p>Total Participants: {totalParticipants}</p>
            <p>Total Participants Left: {unclaimedParticipants}</p>
            <p>Students Left: {unclaimedStudents}</p>
            <p>Mentors Left: {unclaimedMentors}</p>
          </div>
        )}
        <div className="p-4 bg-gray-800 rounded-lg mb-4">
          <h3 className="text-lg font-semibold">Meal Counts</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: ["Breakfast", "Lunch", "Dinner"],
                datasets: [
                  {
                    label: "Count",
                    data: [counts.breakfast, counts.lunch, counts.dinner],
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0, // Ensure numbers are not floats
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  title: {
                    display: false,
                    text: "Meal Counts",
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg mb-12">
          <h3 className="text-lg font-semibold">Demographics Data</h3>
          <ul className="flex flex-col gap-2">
            {data.map((item, index) => (
              <li key={index} className="bg-gray-700 p-2 rounded-2xl">
                {item.participant.name} , {item.participant.teamName}
                <br />
                {item.mealType} , {item.date}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}