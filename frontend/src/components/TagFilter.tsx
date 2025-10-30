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
            <button
            className={activeTag === null ? "tag-button active" : "tag-button"}
            onClick={() => onSelectTag(null)}
            >
            All
            </button>
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
