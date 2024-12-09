import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { query } = req.query;
      const client = await clientPromise;
      const database = client.db("SIH24AJCE");
      const participants = database.collection("participants");

      const teams = await participants.distinct("teamName", {
        teamName: { $regex: query, $options: "i" },
      });

      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
      console.error(error);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}