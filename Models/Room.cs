using Google.Cloud.Firestore;

namespace ActividadS4.API.Models;

/// <summary>
/// Room representa una habitación en la base de datos
/// Se almacena como un documento en la colección "rooms" de Firestore
/// </summary>
/// 
[FirestoreData]
public class Room
{
    /** 
     * Id: Identificador único de la habitación
     * En Firestore, es el ID del documento (autogenerado o GUID)
     * Ejemplo: room_abc123, room_001, etc.
     */
    [FirestoreProperty]
    public string Id { get; set; } = string.Empty;

    /**
     * NumberOrName: Número o nombre visible de la habitación
     * Lo que ven los huéspedes y gerentes (ej: "101", "Suite Luna", "Bungalow 12")
     */
    [FirestoreProperty]
    public string RoomNumber { get; set; } = string.Empty;

    /**
     * Type: Tipo o categoría de la habitación
     * Ejemplos: "Estándar", "Junior Suite", "Suite Deluxe", "Familiar", "Con vista al mar"
     */
    [FirestoreProperty]
    public string Type { get; set; } = string.Empty;

    /**
     * Capacity: Capacidad máxima de personas
     * Número total (adultos + niños según reglas del hotel)
     * Ejemplo: 2, 4, 6
     */
    [FirestoreProperty]
    public int Capacity { get; set; }

    /**
     * Description: Descripción detallada de la habitación
     * Características, ambiente, servicios incluidos, etc.
     */
    [FirestoreProperty]
    public string Description { get; set; } = string.Empty;

    /**
     * BasePricePerNight: Tarifa base por noche
     * Precio sin impuestos, promociones ni ajustes por temporada
     * Se usa para cálculos iniciales y mostrar al huésped
     */
    [FirestoreProperty]
    public decimal BasePricePerNight { get; set; }

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

    //Precio base por noche 

    [FirestoreProperty]
    public decimal BaseRate { get; set; }
    [FirestoreProperty]
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
