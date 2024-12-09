import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "search parameter is required" });
    }

    try {
      const client = await clientPromise;
      const database = client.db("SIH24AJCE");
      const participants = database.collection("participants");

      const results = await participants
        .find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { teamName: { $regex: query, $options: "i" } },
            { mailId: { $regex: query, $options: "i" } },
          ],
        })
        .limit(10)
        .toArray();
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
      console.error(error);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
