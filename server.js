import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

async function fetchCodeChefData(username) {
  try {
    const res = await fetch(`https://www.codechef.com/users/${username}`);
    const html = await res.text();

    // Quick pattern extraction
    const rating = html.match(/"rating":(\d+)/)?.[1];
    const stars = html.match(/"stars":"(.*?)"/)?.[1];
    const maxRating = html.match(/"highest_rating":(\d+)/)?.[1];

    // Optional: scrape history JSON if available
    const ratingHistory = [];
    const historyMatch = html.match(/var all_rating = (.*?);<\/script>/);
    if (historyMatch) {
      const jsonString = historyMatch[1];
      const parsed = JSON.parse(jsonString);
      parsed.forEach((r) => {
        ratingHistory.push({
          date: new Date(r.end_date).toLocaleDateString(),
          rating: r.rating,
          contest: r.name,
          platform: "CC",
        });
      });
    }

    return { rating, stars, maxRating, history: ratingHistory };
  } catch (err) {
    console.error("Error fetching CodeChef profile", err);
    return null;
  }
}

app.get("/codechef/:username", async (req, res) => {
  const { username } = req.params;
  const data = await fetchCodeChefData(username);
  if (!data) return res.status(500).json({ error: "Failed to fetch CodeChef data" });
  res.json(data);
});

app.listen(PORT, () => console.log(`✅ CodeChef API running on port ${PORT}`));
