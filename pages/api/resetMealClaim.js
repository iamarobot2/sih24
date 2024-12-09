import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { participant, mealType } = req.body;
      if (!participant || !mealType) {
        return res.status(400).json({ message: "Participant and meal type are required" });
      }
      const client = await clientPromise;
      const database = client.db("SIH24AJCE");
      const claims = database.collection("mealClaims");
      const currentDate = new Date().toISOString().split("T")[0];

      const result = await claims.deleteOne({
        "participant.participantId": participant.participantId,
        mealType,
        date: currentDate,
      });

      if (result.deletedCount === 0) {
        return res.status(400).json({ message: "No meal claim found to reset" });
      }

      res.status(200).json({ message: "Meal claim reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
      console.error(error);
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}