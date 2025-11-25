import "../styles/EditProfile.css";

import { useState } from "react";

function EditProfilePopup({
    currentAvatar,
    currentBio,
    onSave,
}: {
    currentAvatar: string;
    currentBio: string;
    onSave: (formData: FormData) => Promise<void>;
}) {
    const [avatar, setAvatar] = useState(currentAvatar); // preview
    const [avatarFile, setAvatarFile] = useState<File | null>(null); // actual file
    const [bio, setBio] = useState(currentBio);
    const [loading, setLoading] = useState(false);

    // Handle image selection
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);

        // Preview
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") setAvatar(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("bio", bio);
        if (avatarFile) formData.append("avatar", avatarFile);

        try {
            await onSave(formData);
        } catch (err) {
            console.error("Failed to save profile:", err);
        }

        setLoading(false);
    };

    return (
        <form className="edit-profile-form" onSubmit={handleSubmit}>
            <div className="avatar-section">
                <label>Profile Picture</label>
                <div className="avatar-preview-container">
                    <img
                        src={avatar}
                        alt="avatar preview"
                        className="avatar-preview"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                    />
                </div>
            </div>

            <div className="bio-section">
                <label>Bio</label>
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                />
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </button>
        </form>
    );
}

export default EditProfilePopup;
