using Google.Cloud.Firestore;
using System.Text.Json.Serialization;

namespace ActividadS4.API.Models;

/// <summary>
/// Room representa una habitación en la base de datos
/// Se almacena como un documento en la colección "rooms" de Firestore
/// </summary>
/// 
[FirestoreData]
public class Room
{
    [JsonPropertyName("id")]
    [FirestoreProperty]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("roomNumber")]
    [FirestoreProperty(Name = "NumberOrName")]
    public string RoomNumber { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    [FirestoreProperty]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("capacity")]
    [FirestoreProperty]
    public int Capacity { get; set; }

    [JsonPropertyName("description")]
    [FirestoreProperty]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("basePricePerNight")]
    [FirestoreProperty]
    public double BasePricePerNight { get; set; }

    [JsonPropertyName("baseRate")]
    [FirestoreProperty]
    public double BaseRate { get; set; }

    /**
     * AverageRating: Calificación promedio de huéspedes
     * Se calcula automáticamente a partir de las reseñas
     * Rango típico: 0.0 - 5.0
     */
    [FirestoreProperty]
    public double AverageRating { get; set; }

    /**
     * TotalRatings: Cantidad total de reseñas recibidas
     * Se incrementa cada vez que un huésped califica la habitación
     */
    [FirestoreProperty]
    public int TotalRatings { get; set; }

    /**
     * CreatedAt: Fecha y hora en que se agregó la habitación
     * Se asigna automáticamente al crear el documento
     */

    //Este es un contador para ver cuantas veces ha sido reservada esta habitacion

    [FirestoreProperty]
    public int ReservationCount { get; set; }
    //Aqui se indica si la habitacion esta disponible para hacer nuevas reservas
    [FirestoreProperty]
    [JsonPropertyName("isAvailable")]
    public bool IsAvailable { get; set; } = true;
    [FirestoreProperty]
    public DateTime CreatedAt { get; set; }

    /**
     * CreatedBy: ID del usuario (gerente) que creó la habitación
     * Solo gerentes pueden agregar o modificar habitaciones
     */
    [FirestoreProperty]
    public string CreatedBy { get; set; } = string.Empty;
}
