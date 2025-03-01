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
                imageTags = tags 
                    ? (Array.isArray(tags) ? tags : JSON.parse(tags)) 
                    : [];
            } 
            else {
                const imageMetadata = metadata ? JSON.parse(metadata)[i] : {};
                imageTitle = imageMetadata.title || "Untitled";
                imageDescription = imageMetadata.description || "No description";
                imageTags = imageMetadata.tags 
                    ? (Array.isArray(imageMetadata.tags) ? imageMetadata.tags : JSON.parse(imageMetadata.tags)) 
                    : [];
            }

            const newImage = await Image.create({
                url: result.secure_url,
                public_id: result.public_id,
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
        res.status(500).json({ 
            error: "Server Error", 
            details: error.message 
        });
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

// Delete images
exports.deleteImages = async (req, res) => {
    try {
        const { imageIds } = req.body;
        if (!Array.isArray(imageIds) || imageIds.length === 0) {
            return res.status(400).json({
                error: "No image selected"
            });
        }

        const deletedImages = [];
        for (let i = 0; i < imageIds.length; i++) {
            const imageId = imageIds[i];

            // Find image in the database by public_id
            const image = await Image.findOne({ public_id: imageId });
            if (!image) {
                return res.status(404).json({
                    error: `Image with public_id ${imageId} not found`
                });
            }

            const result = await cloudinary.uploader.destroy(image.public_id);

            // Handle Cloudinary deletion result
            if (result.result !== "ok") {
                return res.status(500).json({
                    error: `Failed to delete image with public_id ${imageId}. Cloudinary response: ${result.error || 'Unknown error'}`,
                });
            }

            // Delete the image
            await Image.findOneAndDelete({ public_id: imageId });
            deletedImages.push(imageId);
        }

        res.status(200).json({
            message: "Images deleted successfully",
            deletedImages,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};
