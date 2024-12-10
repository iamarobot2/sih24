import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bar } from "react-chartjs-2";
import SearchTeam from "@/components/SearchTeam";

export default function Demographics({
  initialData = [],
  initialMealType = "All",
  initialTeam = [],
  initialDate = new Date().toISOString().split("T")[0],
  initialRole = "All",
}) {
  const [data, setData] = React.useState(initialData);
  const [mealType, setMealType] = React.useState(initialMealType);
  const [team, setTeam] = React.useState(initialTeam);
  const [date, setDate] = React.useState(initialDate);
  const [role, setRole] = React.useState(initialRole);
  const [counts, setCounts] = React.useState({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });
  const [totalParticipants, setTotalParticipants] = React.useState(0);
  const [unclaimedParticipants, setUnclaimedParticipants] = React.useState(0);
  const [unclaimedStudents, setUnclaimedStudents] = React.useState(0);
  const [unclaimedMentors, setUnclaimedMentors] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.BASE_URL}/api/demographics?mealType=${mealType}&team=${team.join(
            ","
          )}&date=${date}&role=${role}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result.claimsData || []);
        setCounts({
          breakfast: result.claimsData.filter(
            (item) => item.mealType === "Breakfast"
          ).length,
          lunch: result.claimsData.filter((item) => item.mealType === "Lunch")
            .length,
          dinner: result.claimsData.filter((item) => item.mealType === "Dinner")
            .length,
        });
        setTotalParticipants(result.totalParticipants || 0);
        setUnclaimedParticipants(result.unclaimedParticipants || 0);
        setUnclaimedStudents(result.unclaimedStudents || 0);
        setUnclaimedMentors(result.unclaimedMentors || 0);
      } catch (error) {
        console.error("Error fetching demographics data", error);
      }
    };

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

export async function getServerSideProps(context) {
  const {
    mealType = "All",
    team = [],
    date = new Date().toISOString().split("T")[0],
    role = "All",
  } = context.query;

  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/demographics?mealType=${mealType}&team=${team.join(",")}&date=${date}&role=${role}`
    );
    const result = await response.json();

    return {
      props: {
        initialData: result.claimsData || [],
        initialMealType: mealType,
        initialTeam: team,
        initialDate: date,
        initialRole: role,
      },
    };
  } catch (error) {
    console.error("Error fetching demographics data", error);
    return {
      props: {
        initialData: [],
        initialMealType: mealType,
        initialTeam: team,
        initialDate: date,
        initialRole: role,
      },
    };
  }
}