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

app.listen(3000, () => {
  console.log("Server running on port 3000")
})
