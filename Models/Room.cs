namespace ActividadS4.API.Models;

/// <summary>
/// Room representa una habitación en la base de datos
/// Se almacena como un documento en la colección "rooms" de Firestore
/// </summary>
public class Room
{
    /** 
     * Id: Identificador único de la habitación
     * En Firestore, es el ID del documento (autogenerado o GUID)
     * Ejemplo: room_abc123, room_001, etc.
     */
    public string Id { get; set; } = string.Empty;

    /**
     * NumberOrName: Número o nombre visible de la habitación
     * Lo que ven los huéspedes y gerentes (ej: "101", "Suite Luna", "Bungalow 12")
     */
    public string NumberOrName { get; set; } = string.Empty;

    /**
     * Type: Tipo o categoría de la habitación
     * Ejemplos: "Estándar", "Junior Suite", "Suite Deluxe", "Familiar", "Con vista al mar"
     */
    public string Type { get; set; } = string.Empty;

    /**
     * Capacity: Capacidad máxima de personas
     * Número total (adultos + niños según reglas del hotel)
     * Ejemplo: 2, 4, 6
     */
    public int Capacity { get; set; }

    /**
     * Description: Descripción detallada de la habitación
     * Características, ambiente, servicios incluidos, etc.
     */
    public string Description { get; set; } = string.Empty;

    /**
     * BasePricePerNight: Tarifa base por noche
     * Precio sin impuestos, promociones ni ajustes por temporada
     * Se usa para cálculos iniciales y mostrar al huésped
     */
    public decimal BasePricePerNight { get; set; }

    /**
     * AverageRating: Calificación promedio de huéspedes
     * Se calcula automáticamente a partir de las reseñas
     * Rango típico: 0.0 - 5.0
     */
    public double AverageRating { get; set; }

    /**
     * TotalRatings: Cantidad total de reseñas recibidas
     * Se incrementa cada vez que un huésped califica la habitación
     */
    public int TotalRatings { get; set; }

    /**
     * CreatedAt: Fecha y hora en que se agregó la habitación
     * Se asigna automáticamente al crear el documento
     */
    public DateTime CreatedAt { get; set; }

    /**
     * CreatedBy: ID del usuario (gerente) que creó la habitación
     * Solo gerentes pueden agregar o modificar habitaciones
     */
    public string CreatedBy { get; set; } = string.Empty;
}
