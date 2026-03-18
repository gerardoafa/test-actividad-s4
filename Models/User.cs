using Google.Cloud.Firestore;

namespace ActividadS4.API.Models;

[FirestoreData]
public class User
{
    [FirestoreProperty]
    public string Id { get; set; } = string.Empty;
    [FirestoreProperty]
    public string Email { get; set; } = string.Empty;
    [FirestoreProperty]
    public string Fullname { get; set; } = string.Empty;
    [FirestoreProperty]
    public string Role { get; set; } = string.Empty;
    [FirestoreProperty]
    public string ProfilePictureUrl { get; set; } = string.Empty;
    [FirestoreProperty]
    public int TotalRatings { get; set; }
    [FirestoreProperty]
    public DateTime CreatedAt { get; set; }
    [FirestoreProperty]
    public bool HasReserved { get; set; }
    [FirestoreProperty]
    public string ReservedRoom { get; set; } = string.Empty;
    [FirestoreProperty]
    public string ReservedDates { get; set; } = string.Empty;
    [FirestoreProperty]
    public DateTime? ReservationTimestamp { get; set; }
    [FirestoreProperty]
    public DateTime LastLogin { get; set; }
    [FirestoreProperty]
    public bool IsActive { get; set; } = true;
}