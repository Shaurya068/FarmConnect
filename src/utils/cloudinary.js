import axios from 'axios';

// Replace with your actual Cloudinary details
const CLOUD_NAME = "dq3f158ss"; // From Cloudinary dashboard
const UPLOAD_PRESET = "product_images"; // From upload preset setup

export const uploadImageToCloudinary = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'farmer_marketplace'); // Optional: organize images

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        return {
            success: true,
            url: response.data.secure_url,
            publicId: response.data.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Helper function to validate image files
export const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'Please upload a valid image (JPEG, PNG, GIF, WebP)'
        };
    }

    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'Image size must be less than 5MB'
        };
    }

    return { isValid: true };
};
