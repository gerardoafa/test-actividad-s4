namespace ActividadS4.API.Models
{
    /// <summary>
    /// Contiene los datos estadísticos calculados para el dashboard del gerente.
    /// No se almacena en Firestore — se calcula en tiempo real desde las reservas.
    /// </summary>
    public class ReservationStatistics
    {
        /// <summary>
        /// Total de habitaciones registradas en el sistema
        /// </summary>
        public int TotalRooms { get; set; }

        /// <summary>
        /// Suma total de noches reservadas en todas las reservas
        /// </summary>
        public int TotalNightsReserved { get; set; }

        /// <summary>
        /// Porcentaje de ocupación calculado: (HabitacionesReservadas / TotalHabitaciones) × 100
        /// </summary>
        public double OccupancyPercentage { get; set; }

        /// <summary>
        /// Ingresos totales generados por todas las reservas confirmadas
        /// </summary>
        public decimal TotalRevenue { get; set; }

        /// <summary>
        /// Número de reservas agrupadas por tipo de habitación.
        /// Usado para el gráfico de barras del dashboard.
        /// Ejemplo: { "Suite": 5, "Doble": 12, "Simple": 8 }
        /// </summary>
        public Dictionary<string, int> ReservationsByRoomType { get; set; } = new();

        /// <summary>
        /// Ingresos agrupados por período (mes/semana).
        /// Usado para el gráfico de tendencia temporal del dashboard.
        /// Ejemplo: { "Enero 2026": 15000.00, "Febrero 2026": 18500.00 }
        /// </summary>
        public Dictionary<string, decimal> RevenueByPeriod { get; set; } = new();
    }
}
