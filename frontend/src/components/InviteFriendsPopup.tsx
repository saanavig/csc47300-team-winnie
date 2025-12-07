import "../styles/InviteFriendsPopup.css";

import { useEffect, useState } from "react";

interface InviteFriendsPopupProps {
    albumId: string | undefined;
    token: string | null;
    onClose: () => void;
}

    export default function InviteFriendsPopup({ albumId, token, onClose }: InviteFriendsPopupProps) {
    const [username, setUsername] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("Invite popup mounted", { albumId, token });
    }, [albumId, token]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Invite clicked!", { username, albumId, token });

        if (!username.trim()) {
        setStatus("Please enter a username");
        return;
        }
        if (!albumId || !token) {
        setStatus("Album ID or token missing!");
        return;
        }

        setLoading(true);
        setStatus(null);

        try {
        const res = await fetch(`http://127.0.0.1:5000/albums/${albumId}/invite`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ username }),
        });

        let json;
        try {
            json = await res.json();
        } catch {
            json = { error: "Invalid server response" };
        }

        console.log("Server response:", json);

        if (res.ok) {
            setStatus(json.message || "Invitation sent!");
            setUsername("");
        } else {
            setStatus(json.error || "Failed to send invite.");
        }
        } catch (err: any) {
        console.error("Network error:", err);
        setStatus(err.message || "Network error.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="invite-popup-container">
        <form className="invite-friends-form" onSubmit={handleInvite}>
            <label>Invite a friend to this album:</label>
            <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit" disabled={loading}>
            {loading ? "Inviting..." : "Send Invite"}
            </button>
            {status && <p className="status-message">{status}</p>}
        </form>
        </div>
    );
}
