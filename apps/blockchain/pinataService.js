const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";

function getAuthHeaders() {
  if (!process.env.PINATA_JWT) {
    throw new Error("Missing PINATA_JWT in .env");
  }

  return {
    Authorization: `Bearer ${process.env.PINATA_JWT}`
  };
}

async function uploadImageToIPFS(filePath) {
  const absoluteFilePath = path.resolve(filePath);

  if (!fs.existsSync(absoluteFilePath)) {
    throw new Error(`Image file not found: ${absoluteFilePath}`);
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(absoluteFilePath));
  formData.append("pinataMetadata", JSON.stringify({
    name: path.basename(absoluteFilePath)
  }));

  const response = await axios.post(`${PINATA_BASE_URL}/pinFileToIPFS`, formData, {
    maxBodyLength: Infinity,
    headers: {
      ...getAuthHeaders(),
      ...formData.getHeaders()
    }
  });

  return response.data.IpfsHash;
}

async function uploadMetadataToIPFS(name, breed, birthYear, imageCID) {
  const metadata = {
    name,
    description: `Race horse profile NFT for ${name}`,
    image: `ipfs://${imageCID}`,
    attributes: [
      {
        trait_type: "breed",
        value: breed
      },
      {
        trait_type: "birthYear",
        value: birthYear
      }
    ]
  };

  const body = {
    pinataMetadata: {
      name: `${name.replace(/\s+/g, '_')}_metadata.json`
    },
    pinataContent: metadata
  };

  const response = await axios.post(
    `${PINATA_BASE_URL}/pinJSONToIPFS`,
    body,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.IpfsHash;
}

module.exports = {
  uploadImageToIPFS,
  uploadMetadataToIPFS
};
