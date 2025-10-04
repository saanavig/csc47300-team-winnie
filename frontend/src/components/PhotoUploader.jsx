import { useState } from 'react';
import '../styles/PhotoUploader.css';

function PhotoUploader({ onPhotoUploaded }) {
  const [uploadType, setUploadType] = useState('file');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setPreviewUrl(e.target.value);
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const newPhoto = {
      id: Date.now(),
      url: uploadType === 'file' ? previewUrl : imageUrl,
      tags: tagsArray,
      uploadDate: new Date().toISOString(),
    };
    
    onPhotoUploaded(newPhoto);
    
    // Reset form
    setImageUrl('');
    setFile(null);
    setTags('');
    setPreviewUrl('');
  };

  // Reset file input by creating a key that changes whenever file is reset
  const fileInputKey = file ? 'has-file' : 'no-file';

  return (
    <div className="photo-uploader">
      <h2>Upload a New Memory</h2>
      
      <div className="upload-type-toggle">
        <button 
          className={uploadType === 'file' ? 'active' : ''}
          onClick={() => setUploadType('file')}>
          Upload File
        </button>
        <button 
          className={uploadType === 'url' ? 'active' : ''}
          onClick={() => setUploadType('url')}>
          Image URL
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {uploadType === 'file' ? (
          <div className="form-group">
            <label htmlFor="photo-file">Choose a photo:</label>
            <input 
              type="file" 
              id="photo-file"
              key={fileInputKey} // Add key to force re-render when file is reset
              accept="image/*" 
              onChange={handleFileChange} 
              required
            />
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
            value={tags || ''} // Ensure it's never undefined
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
        
        <button type="submit" className="upload-button">Upload Photo</button>
      </form>
    </div>
  );
}

export default PhotoUploader;