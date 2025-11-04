import "../styles/TagFilter.css";

interface Photo {
    id: string | number;
    url: string;
    tags: string[];
}

interface TagFilterProps {
    photos: Photo[];
    activeTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({ photos, activeTag, onSelectTag }: TagFilterProps) {
    // get unique tags array
    const allTags: string[] = photos.reduce((tags: string[], photo) => {
    photo.tags.forEach((tag) => {
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
        {/* "All" clears the active tag */}
        <button
        className={activeTag === null ? "tag-button active" : "tag-button"}
        onClick={() => onSelectTag(null)}
        >
        All
        </button>

        {/* Map unique tags to buttons */}
        {allTags.map((tag) => (
        <button
            key={tag}
            className={activeTag === tag ? "tag-button active" : "tag-button"}
            onClick={() => onSelectTag(tag)}
        >
            {tag}
        </button>
        ))}
    </div>
    </div>
);
}
