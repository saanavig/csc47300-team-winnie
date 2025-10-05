import '../styles/TagFilter.css';

function TagFilter({ photos, activeTag, onSelectTag }) {
  // Extract all unique tags from photos
  const allTags = photos.reduce((tags, photo) => {
    photo.tags.forEach(tag => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
    return tags;
  }, []);

  return (
    <div className="tag-filter">
      <h3>Filter by Tags</h3>
      <div className="tag-list">
        <button 
          className={activeTag === null ? 'tag-button active' : 'tag-button'}
          onClick={() => onSelectTag(null)}
        >
          All
        </button>
        {allTags.map(tag => (
          <button 
            key={tag}
            className={activeTag === tag ? 'tag-button active' : 'tag-button'}
            onClick={() => onSelectTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagFilter;