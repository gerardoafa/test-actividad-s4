using ActividadS4.API.DTOs;
using ActividadS4.API.Models;

namespace ActividadS4.API.Services
{
    /// <summary>
    /// Define los contratos para la generación de reportes del dashboard.
    /// Los datos se calculan en tiempo real desde Firestore.
    /// </summary>
    public interface IReportService
    {
        /// <summary>
        /// Calcula las estadísticas generales del hotel:
        /// ocupación, ingresos, noches reservadas y distribución por tipo.
        /// </summary>
        Task<ReservationStatistics> GetStatisticsAsync();
    }
}
