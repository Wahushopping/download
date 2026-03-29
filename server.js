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

  // ❌ block login/private links
  if (url.includes("login") || url.includes("accounts")) {
    return res.send("❌ Private or login-required video not supported")
  }

  const filePath = path.join(__dirname, `video-${Date.now()}.mp4`)

  const ytdlp = spawn("yt-dlp", [
    "-f", "bv*+ba/b",
    "--no-playlist",
    "--geo-bypass",
    "--no-check-certificate",
    "--force-overwrites",
    "-o", filePath,
    url
  ])

  ytdlp.stderr.on("data", (data) => {
    console.log(data.toString())
  })

  ytdlp.on("close", (code) => {

    // ❌ yt-dlp failed
    if (code !== 0) {
      return res.send("❌ Download failed (video may be private/restricted)")
    }

    // ❌ file not created
    if (!fs.existsSync(filePath)) {
      return res.send("❌ File not found (download failed)")
    }

    // ✅ send file
    res.download(filePath, "video.mp4", () => {
      // ✅ safe delete
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    })

  })

  ytdlp.on("error", (err) => {
    console.log("Error:", err)
    res.send("❌ Server error")
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
