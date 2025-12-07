import React from "react";

interface AlbumInvite {
    album_id: string;
    inviter: string;
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
    const handleAcceptInvite = async (albumId: string) => {
        if (!token) return;
        try {
        const res = await fetch(`http://127.0.0.1:5000/albums/${albumId}/join`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
            setAlbumInvites(albumInvites.filter((i) => i.album_id !== albumId));
            const json = await res.json();
            if (json.album) onJoinAlbum(json.album);
        }
        } catch (err) {
        console.error(err);
        }
    };

    const handleDeclineInvite = (albumId: string) => {
        setAlbumInvites(albumInvites.filter((i) => i.album_id !== albumId));
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

    return (
        <div>
        <h2></h2>

        {/* Friend Requests */}
        {friendRequests.length ? (
            friendRequests.map((req) => (
            <div key={req.username} className="notification-item">
                <span>{req.username} sent you a friend request</span>
                <button onClick={() => handleFriendResponse(req.username, "accept")}>Accept</button>
                <button onClick={() => handleFriendResponse(req.username, "decline")}>Decline</button>
            </div>
            ))
        ) : null}

        {/* Album Invites */}
        {albumInvites.length ? (
            albumInvites.map((invite) => (
            <div key={invite.album_id} className="notification-item">
                <span>{invite.inviter} invited you to an album</span>
                <button onClick={() => handleAcceptInvite(invite.album_id)}>Accept</button>
                <button onClick={() => handleDeclineInvite(invite.album_id)}>Decline</button>
            </div>
            ))
        ) : null}

        {!friendRequests.length && !albumInvites.length && <p>No new notifications</p>}
        </div>
    );
};

export default Notifications;
