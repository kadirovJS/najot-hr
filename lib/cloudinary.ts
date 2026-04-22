import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadVideo = async (fileUri: string) => {
  try {
    const res = await cloudinary.uploader.upload(fileUri, {
      resource_type: 'video',
      folder: 'najot-hr-onboarding',
    });
    return res;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

export const deleteVideo = async (publicId: string) => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    throw error;
  }
};

export default cloudinary;
