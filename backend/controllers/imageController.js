const cloudinary = require("../config/cloudinaryConfig");
const Image = require("../models/Image");

// Upload multiple images
exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        const { applySameMetadata, title, description, tags, metadata } = req.body;
        const uploadedImages = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];

            // Convert buffer to Cloudinary upload stream
            const uploadStream = async () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "Impulse", resource_type: "image" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(file.buffer);
                });
            };

            const result = await uploadStream();

            let imageTitle, imageDescription, imageTags;

            if (applySameMetadata === "true") {
                imageTitle = title || "Untitled";
                imageDescription = description || "No description";
                imageTags = tags ? tags.split(",") : [];
            } else {
                const imageMetadata = metadata ? JSON.parse(metadata)[i] : {};
                imageTitle = imageMetadata.title || "Untitled";
                imageDescription = imageMetadata.description || "No description";
                imageTags = imageMetadata.tags ? imageMetadata.tags.split(",") : [];
            }

            const newImage = await Image.create({
                url: result.secure_url,
                uploadedBy: req.user?._id,
                title: imageTitle,
                description: imageDescription,
                tags: imageTags,
            });

            uploadedImages.push(newImage);
        }

        res.status(201).json({
            message: "Images uploaded successfully",
            images: uploadedImages,
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error", details: error.message });
    }
};

// Get all images
exports.getImages = async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "Images retrieved successfully",
            images,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch images",
            error: error.message,
        });
    }
};
