import "../styles/PhotoUploader.css";
import { ChangeEvent, FormEvent, useState } from "react";
import { Photo } from "../types";

interface PhotoUploaderProps {
  onPhotoUploaded: (photo: Photo) => void;
}

export default function PhotoUploader({ onPhotoUploaded }: PhotoUploaderProps) {
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [tags, setTags] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);

      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setPreviewUrl(e.target.value);
  };

  const handleTagsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: uploadType === "file" ? previewUrl : imageUrl,
      tags: tagsArray,
      uploadDate: new Date().toISOString(),
    };

    onPhotoUploaded(newPhoto);

    // Reset form
    setImageUrl("");
    setFile(null);
    setFileName("");
    setTags("");
    setPreviewUrl("");
  };

  // const fileInputKey = file ? "has-file" : "no-file";

  return (
    <div className="photo-uploader">
      <h2>Upload a New Memory</h2>

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

        <button type="submit" className="upload-button">
          Upload Photo
        </button>
      </form>
    </div>
  );
}