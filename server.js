const express = require("express")
const cors = require("cors")
const { spawn } = require("child_process")

const app = express()

app.use(cors())
app.use(express.static("public"))

app.get("/download", (req, res) => {
  const url = req.query.url

  if (!url) {
    return res.send("No URL")
  }

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="video.mp4"'
  )

  const ytdlp = spawn("yt-dlp", [
    "-f", "mp4",
    "-o", "-",
    url
  ])

  ytdlp.stdout.pipe(res)

  ytdlp.stderr.on("data", (data) => {
    console.log(data.toString())
  })
})
app.get("/info", (req, res) => {
  const url = req.query.url

  if (!url) {
    return res.json({ error: "No URL" })
  }

  const ytdlp = spawn("yt-dlp", [
    "-j", // JSON output
    url
  ])

  let data = ""

  ytdlp.stdout.on("data", chunk => {
    data += chunk.toString()
  })

  ytdlp.on("close", () => {
    try {
      const json = JSON.parse(data)

      res.json({
        video: json.url,          // direct video link
        thumbnail: json.thumbnail,
        title: json.title
      })
    } catch (err) {
      res.json({ error: "Failed to fetch" })
    }
  })
})
app.listen(3000, () => {
  console.log("Server running on port 3000")
})
