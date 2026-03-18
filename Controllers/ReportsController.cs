namespace ActividadS4.API.Controllers
{
    using ActividadS4.API.Services;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;

    /// <summary>
    /// ReportsController maneja los reportes y estadísticas del dashboard.
    /// Solo el gerente puede acceder a estos endpoints.
    /// Los datos se calculan en tiempo real desde Firestore.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "gerente")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportsController> _logger;

        /// <summary>
        /// Constructor: Recibe IReportService inyectado desde Program.cs
        /// </summary>
        public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        /// <summary>
        /// GET /api/reports/statistics
        /// Obtiene las estadísticas generales del hotel en tiempo real (solo gerente).
        /// 
        /// Respuesta exitosa (200):
        /// {
        ///   "totalRooms": 10,
        ///   "totalNightsReserved": 45,
        ///   "occupancyPercentage": 70.5,
        ///   "totalRevenue": 125000.00,
        ///   "reservationsByRoomType": {
        ///     "Suite": 5,
        ///     "Doble": 12,
        ///     "Simple": 8
        ///   },
        ///   "revenueByPeriod": {
        ///     "Enero 2026": 45000.00,
        ///     "Febrero 2026": 80000.00
        ///   }
        /// }
        /// 
        /// Errores:
        /// 403: No es gerente
        /// 500: Error del servidor
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var statistics = await _reportService.GetStatisticsAsync();
                _logger.LogInformation("Estadísticas obtenidas correctamente");
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error al obtener estadísticas: {ex.Message}");
                return StatusCode(500, new { message = "Error al obtener estadísticas" });
            }
        }
    }
}
