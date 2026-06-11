export async function uploadToCloudinary(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "armosi_upload");

  let response;

  try {
    response = await fetch(
      "https://api.cloudinary.com/v1_1/dvkycowft/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );
  } catch {
    throw new Error("Could not reach Cloudinary. Check your internet connection and try again.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || "Cloudinary rejected the image upload.";
    throw new Error(message);
  }

  if (!data?.secure_url) {
    throw new Error("Cloudinary upload completed without returning an image URL.");
  }

  return data.secure_url;
}
