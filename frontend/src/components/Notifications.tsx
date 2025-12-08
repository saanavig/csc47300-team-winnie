import React from "react";

interface AlbumInvite {
    album_id: string;
    inviter: string;
    title?: string; // optional album title
}

interface FriendRequest {
    username: string;
}

interface NotificationsProps {
    token: string | null;
    friendRequests: FriendRequest[];
    setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
    albumInvites: AlbumInvite[];
    setAlbumInvites: React.Dispatch<React.SetStateAction<AlbumInvite[]>>;
    onJoinAlbum: (album: any) => void;
}

const Notifications: React.FC<NotificationsProps> = ({
    token,
    friendRequests,
    setFriendRequests,
    albumInvites,
    setAlbumInvites,
    onJoinAlbum,
}) => {
    console.log("Current albumInvites:", albumInvites);

    const handleAcceptInvite = async (albumId: string | undefined) => {
        console.log("Accept clicked, albumId:", albumId, "token:", token);
        if (!token || !albumId) return;
        try {
            // Use the correct endpoint that matches your backend
            const res = await fetch(`http://127.0.0.1:5000/albums/${albumId}/invite/respond`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ action: "accept" })  // Add the action parameter
            });
            
            const json = await res.json();
            
            if (res.ok) {
                alert(json.message || "Invite accepted!");
                setAlbumInvites(albumInvites.filter((i) => i.album_id !== albumId));
                if (json.album) onJoinAlbum(json.album);
            } else {
                alert(json.error || "Failed to accept invite");
            }
        } catch (err) {
            console.error(err);
            alert("Network error");
        }
    };

    const handleDeclineInvite = async (albumId: string | undefined) => {
        if (!albumId || !token) return;
        try {
            const res = await fetch(`http://127.0.0.1:5000/albums/${albumId}/invite/respond`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ action: "decline" })
            });
            
            const json = await res.json();
            
            if (res.ok) {
                alert(json.message || "Invite declined");
                setAlbumInvites(albumInvites.filter((i) => i.album_id !== albumId));
            } else {
                alert(json.error || "Failed to decline invite");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFriendResponse = async (username: string, action: "accept" | "decline") => {
        if (!token) return;
        try {
            const res = await fetch("http://127.0.0.1:5000/friends/respond", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ username, action }),
            });
            if (res.ok) setFriendRequests(friendRequests.filter((f) => f.username !== username));
        } catch (err) {
            console.error(err);
        }
    };

    // DEBUG: check albumInvites for missing album_id
    React.useEffect(() => {
        albumInvites.forEach(invite => {
            if (!invite.album_id) console.warn("Missing album_id in invite:", invite);
        });
    }, [albumInvites]);

    return (
        <div>
            {/* Friend Requests */}
            {friendRequests.length
                ? friendRequests.map((req) => (
                        <div key={req.username} className="notification-item">
                            <span>{req.username} sent you a friend request</span>
                            <button onClick={() => handleFriendResponse(req.username, "accept")}>Accept</button>
                            <button onClick={() => handleFriendResponse(req.username, "decline")}>Decline</button>
                        </div>
                    ))
                : null}

            {/* Album Invites */}
            {albumInvites.length
                ? albumInvites.map((invite) => (
                        <div key={invite.album_id} className="notification-item">
                            <span>
                                {invite.inviter} invited you to{" "}
                                <strong>{invite.title || invite.album_id}</strong>
                            </span>
                            <button onClick={() => handleAcceptInvite(invite.album_id)}>Accept</button>
                            <button onClick={() => handleDeclineInvite(invite.album_id)}>Decline</button>
                        </div>
                    ))
                : null}

            {!friendRequests.length && !albumInvites.length && <p>No new notifications</p>}
        </div>
    );
};

export default Notifications;