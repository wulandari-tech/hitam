const express = require('express');
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Konfigurasi multer untuk upload gambar
const upload = multer({ dest: 'uploads/' });

const API = "https://negro.consulting/api/process-image";
const TYPE = [
  "coklat",
  "hitam",
  "nerd",
  "piggy",
  "carbon",
  "botak"
]

async function Hitam(payload) {
  try {
    let baseImage;
    if (Object.keys(payload).length == 0 || !payload?.image || !payload.filter) {
      return {
        ok: false,
        message: "Ingfo gambar yang mau dihitamin"
      }
    }
    if (payload.image || /https|http/gi.test(payload.image)) {
      const res = await axios({
        url: payload.image,
        method: "GET",
        responseType: 'arraybuffer'
      });
      baseImage = Buffer.from(res.data).toString("base64");
    } else {
      baseImage = payload.image;
    }
    if (!TYPE.includes(payload.filter)) {
      return {
        ok: false,
        message: "Filter " + payload.filter + " tidak ada di list."
      }
    }

    const response = await axios({
      url: API,
      method: "POST",
      data: {
        filter: payload.filter,
        imageData: "data:image/png;base64," + baseImage
      }
    });

    response.data.buffer = Buffer.from(response.data.processedImageUrl.replace("data:image/png;base64,", ""), "base64")

    return {
      ok: true,
      message: "Penghitaman massal",
      result: response.data
    }
  } catch (err) {
    return {
      ok: false,
      message: err
    }
  }
}

// Route untuk upload gambar
app.post('/upload', upload.single('image'), async (req, res) => {
  const { filter } = req.body;
  const { path: imagePath } = req.file;

  if (!filter) {
    return res.status(400).json({ message: "Filter tidak disertakan!" });
  }

  const payload = {
    filter,
    image: fs.readFileSync(imagePath, { encoding: 'base64' })
  };

  const hitam = await Hitam(payload);

  if (hitam.ok) {
    // Langsung kembalikan URL gambar yang sudah diproses
    res.json({
      message: "Gambar berhasil diproses!",
      imageUrl: hitam.result.processedImageUrl
    });
  } else {
    res.status(500).json(hitam);
  }
});

// Static file untuk HTML
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
