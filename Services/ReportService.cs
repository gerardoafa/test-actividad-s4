using ActividadS4.API.DTOs;
using ActividadS4.API.Models;
using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ActividadS4.API.Services
{
    using ActividadS4.API.Models;

    /// <summary>
    /// Implementa la generación de estadísticas para el dashboard del gerente.
    /// Todos los datos se calculan en tiempo real desde Firestore.
    /// </summary>
    public class ReportService : IReportService
    {
        private readonly FirebaseService _firebaseService;
        private readonly ILogger<ReportService> _logger;

        /// <summary>Constructor que recibe las dependencias inyectadas</summary>
        public ReportService(FirebaseService firebaseService, ILogger<ReportService> logger)
        {
            _firebaseService = firebaseService;
            _logger = logger;
        }

        /// <summary>
        /// Calcula las estadísticas generales del hotel en tiempo real:
        /// - Total de habitaciones y noches reservadas
        /// - Porcentaje de ocupación
        /// - Ingresos totales generados
        /// - Reservas agrupadas por tipo de habitación (para gráfico de barras)
        /// - Ingresos agrupados por mes (para gráfico de tendencia)
        /// </summary>
        public async Task<ReservationStatistics> GetStatisticsAsync()
        {
            try
            {
                var roomsCollection = _firebaseService.GetCollection("rooms");
                var reservationsCollection = _firebaseService.GetCollection("reservations");

                // Obtener todas las habitaciones y reservas
                var roomsSnapshot = await roomsCollection.GetSnapshotAsync();
                var reservationsSnapshot = await reservationsCollection.GetSnapshotAsync();

                var rooms = roomsSnapshot.Documents
                    .Select(doc => doc.ConvertTo<Room>())
                    .ToList();

                var reservations = reservationsSnapshot.Documents
                    .Select(doc => doc.ConvertTo<Reservation>())
                    .ToList();

                // Calcular habitaciones con al menos una reserva
                var reservedRoomIds = reservations.Select(r => r.RoomId).Distinct().ToList();

                // Calcular estadísticas
                var totalNights = reservations.Sum(r => r.Nights);
                var totalRevenue = reservations.Sum(r => r.TotalCost);
                var occupancyPercentage = rooms.Count > 0
                    ? (double)reservedRoomIds.Count / rooms.Count * 100
                    : 0;

                // Agrupar reservas por tipo de habitación (para gráfico de barras)
                var byRoomType = reservations
                    .GroupBy(r => r.RoomType)
                    .ToDictionary(g => g.Key, g => g.Count());

                // Agrupar ingresos por mes (para gráfico de tendencia temporal)
                var byPeriod = reservations
                    .GroupBy(r => r.Timestamp.ToString("MMMM yyyy"))
                    .ToDictionary(g => g.Key, g => g.Sum(r => r.TotalCost));

                return new ReservationStatistics
                {
                    TotalRooms = rooms.Count,
                    TotalNightsReserved = totalNights,
                    OccupancyPercentage = Math.Round(occupancyPercentage, 2),
                    TotalRevenue = totalRevenue,
                    ReservationsByRoomType = byRoomType,
                    RevenueByPeriod = byPeriod
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al calcular estadísticas: {ex.Message}");
                throw;
            }
        }
    }
}
