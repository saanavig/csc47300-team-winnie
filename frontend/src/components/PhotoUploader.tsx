import "../styles/PhotoUploader.css";
import { ChangeEvent, FormEvent, useState } from "react";
import { Photo } from "../types";

interface PhotoUploaderProps {
  onPhotoUploaded: (photo: Photo) => void;
  albumId?: string | null;
}

export default function PhotoUploader({ onPhotoUploaded, albumId }: PhotoUploaderProps) {
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [tags, setTags] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Warning detection for styling
  const isWarning = Boolean(
    error &&
      /proceed with caution|does not look like an image|warning/i.test(error)
  );

  // Configurable limits
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const IMAGE_EXT_REGEX = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;

  // handle selecting a file: validate, store file and create preview via FileReader
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Basic validation: MIME type and size
      if (!selectedFile.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        setFile(null);
        setFileName("");
        setPreviewUrl("");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File is too large. Max size is 5 MB.");
        setFile(null);
        setFileName("");
        setPreviewUrl("");
        return;
      }
      setError("");

      setFile(selectedFile);
      setFileName(selectedFile.name);

      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  // handle URL input: URL parse + protocol check + extension heuristic
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    // setPreviewUrl(e.target.value);

    // URL validation
    const val = e.target.value.trim();
    if (!val) {
      setPreviewUrl("");
      setError("")
      return;
    }
    try {
      const urlObj = new URL(val);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        setError("URL must use http or https.");
        setPreviewUrl("");
        return;
      }
    } catch {
      setError("Invalid URL.");
      setPreviewUrl("");
      return;
    }

    if (!IMAGE_EXT_REGEX.test(val.split("?")[0])) {
      // extension check may be too strict for some hosts; show a warning but allow user to proceed
      setError("URL does not look like an image (jpg/png/gif etc.). Proceed with caution.");
    } else {
      setError("");
    }
    setPreviewUrl(val);
  };

  const handleTagsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  // submit: validate again, parse tags, construct Photo object, and call parent callback
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Prevent submit if validation error present
    if (error) {
      return;
    }

    // Ensure there's a valid source for the image
    if (uploadType === "file" && !file) {
      setError("Please select an image file to upload.");
      return;
    }
    if (uploadType === "url" && !previewUrl) {
      setError("Please provide a valid image URL.");
      return;
    }

    // parse tags for both server upload and fallback
    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // If we have an albumId and auth token, upload the file to the backend
    const token = localStorage.getItem("token");
    if (uploadType === "file" && file && albumId && token) {
      setCreating(true);
      setCreateError(null);
      try {
        const form = new FormData();
        form.append("photos", file, file.name);
        // send tags for these uploaded photos (as JSON array)
         if (tagsArray.length > 0) {
           form.append("tags", JSON.stringify(tagsArray));
         }

        // backend expects Authorization: Bearer <token>
        const res = await fetch(`http://127.0.0.1:5000/albums/${albumId}/add-photos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || `Server returned ${res.status}`);
        }

        const json = await res.json();
        // response can be either array of URL strings or array of photo objects
        const returned = json.photos || [];
        returned.forEach((item: any, idx: number) => {
          let url = "";
          let id = `${Date.now()}-${idx}`;
          let returnedTags: string[] = tagsArray;
          let uploadDate = new Date().toISOString();
          if (typeof item === "string") {
            url = item;
          } else if (item && typeof item === "object") {
            url = item.url || item.secure_url || "";
            id = item.id || id;
            returnedTags = Array.isArray(item.tags) ? item.tags : returnedTags;
            uploadDate = item.uploadDate || item.createdAt || uploadDate;
          }
          if (url) {
            const newPhoto: Photo = {
              id,
              url,
              tags: returnedTags,
              uploadDate,
              albumId,
            };
            onPhotoUploaded(newPhoto);
          }
        });

        // reset form state
        setImageUrl("");
        setFile(null);
        setFileName("");
        setTags("");
        setPreviewUrl("");
        setError("");
      } catch (err: any) {
        setCreateError(err?.message || "Upload failed");
      } finally {
        setCreating(false);
      }
      return;
    }

    // Fallback: client-side only (preview/dataURL or external URL)
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: uploadType === "file" ? previewUrl : imageUrl,
      tags: tagsArray,
      uploadDate: new Date().toISOString(),
    };

    // Pass the new photo up to parent (PhotoArchive)
    onPhotoUploaded(newPhoto);

    // Reset form
    setImageUrl("");
    setFile(null);
    setFileName("");
    setTags("");
    setPreviewUrl("");
    setError("");
  };

  // const fileInputKey = file ? "has-file" : "no-file";

  return (
    <div className="photo-uploader">
      <h2>Upload a New Memory</h2>

      {error && (
        <p
          className={`upload-error ${isWarning ? "warning" : "error"}`}
          role="alert"
        >
          {error}
        </p>
      )}

      {createError && <p className="upload-error" role="alert">{createError}</p>}

      <div className="upload-type-toggle">
        <button
          className={uploadType === "file" ? "active" : ""}
          onClick={() => setUploadType("file")}
          type="button"
        >
          Upload File
        </button>
        <button
          className={uploadType === "url" ? "active" : ""}
          onClick={() => setUploadType("url")}
          type="button"
        >
          Image URL
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {uploadType === "file" ? (
          <div className="form-group">
            <label htmlFor="photo-file">Choose a photo:</label>
            <input
              type="file"
              id="photo-file"
              // key={fileInputKey}
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {fileName && <p className="selected-filename">Selected file: {fileName}</p>}
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="photo-url">Image URL:</label>
            <input
              type="url"
              id="photo-url"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="photo-tags">Tags (comma separated):</label>
          <input
            type="text"
            id="photo-tags"
            value={tags}
            onChange={handleTagsChange}
            placeholder="family, vacation, summer"
          />
        </div>

        {previewUrl && (
          <div className="image-preview">
            <h3>Preview</h3>
            <img src={previewUrl} alt="Preview" />
          </div>
        )}

        <button type="submit" className="upload-button" disabled={creating}>
          {creating ? "Uploading…" : "Upload Photo"}
        </button>
      </form>
    </div>
  );
}