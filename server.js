const express = require("express")
const cors = require("cors")
const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")
process.env.PATH = process.env.PATH + ":" + __dirname + "/ffmpeg-bin"
const app = express()

app.use(cors())
app.use(express.static("public"))

app.get("/download", (req, res) => {
  const url = req.query.url

  if (!url) {
    return res.send("No URL")
  }

  const filePath = path.join(__dirname, `video-${Date.now()}.mp4`)

  const ytdlp = spawn("yt-dlp", [
  "-f", "bv*+ba/b",   // 🔥 BEST universal fix
  "--no-playlist",
  "--geo-bypass",
  "--no-check-certificate",
  "--force-overwrites",
  "-o", filePath,
  url
])

  ytdlp.on("close", () => {
    // send file after download
    res.download(filePath, "video.mp4", () => {
      // delete file after sending
      fs.unlinkSync(filePath)
    })
  })

  ytdlp.stderr.on("data", (data) => {
    console.log(data.toString())
  })

  ytdlp.on("error", (err) => {
    console.log("Error:", err)
    res.end()
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
