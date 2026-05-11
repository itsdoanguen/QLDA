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

async function uploadMetadataToIPFS(ownerName, location, area, landType, imageCID) {
  const metadata = {
    name: `Land Record - ${ownerName}`,
    description: `Official Land Registry NFT for property located at ${location}`,
    image: `ipfs://${imageCID}`,
    attributes: [
      {
        trait_type: "ownerName",
        value: ownerName
      },
      {
        trait_type: "location",
        value: location
      },
      {
        trait_type: "area",
        value: area
      },
      {
        trait_type: "landType",
        value: landType
      }
    ]
  };

  const body = {
    pinataMetadata: {
      name: `${ownerName.replace(/\s+/g, '_')}_land_metadata.json`
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
