import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { participantId, mealType } = req.query;
      if (!participantId || !mealType) {
        return res.status(400).json({ message: "Participant ID and meal type are required" });
      }
      const client = await clientPromise;
      const database = client.db("SIH24AJCE");
      const claims = database.collection("mealClaims");
      const currentDate = new Date().toISOString().split("T")[0];

      const existingClaim = await claims.findOne({
        "participant.participantId": participantId,
        mealType,
        date: currentDate,
      });

      if (existingClaim) {
        return res.status(200).json({ claimed: true });
      } else {
        return res.status(200).json({ claimed: false });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
      console.error(error);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}