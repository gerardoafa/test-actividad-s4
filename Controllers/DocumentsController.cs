using ActividadS4.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ActividadS4.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly FirebaseService _firebaseService;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(FirebaseService firebaseService, ILogger<DocumentsController> logger)
    {
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> UploadDocument(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "El archivo es requerido" });
            }

            if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Solo se permiten archivos PDF" });
            }

            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new { message = "No autenticado" });
            }

            var document = await _firebaseService.UploadDocumentAsync(file, userId);
            _logger.LogInformation($"Documento subido: {document.FileName} por usuario {userId}");

            return Ok(document);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al subir documento: {ex.Message}");
            return StatusCode(500, new { message = "Error al subir documento" });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetDocuments()
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new { message = "No autenticado" });
            }

            var documents = await _firebaseService.GetDocumentsAsync(userId);
            return Ok(documents);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener documentos: {ex.Message}");
            return StatusCode(500, new { message = "Error al obtener documentos" });
        }
    }

    [HttpGet("{documentId}")]
    public async Task<IActionResult> GetDocument(string documentId)
    {
        try
        {
            var document = await _firebaseService.GetDocumentAsync(documentId);
            if (document == null)
            {
                return NotFound(new { message = "Documento no encontrado" });
            }

            return Ok(document);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al obtener documento: {ex.Message}");
            return StatusCode(500, new { message = "Error al obtener documento" });
        }
    }

    [HttpGet("{documentId}/download")]
    public async Task<IActionResult> DownloadDocument(string documentId)
    {
        try
        {
            var result = await _firebaseService.DownloadDocumentAsync(documentId);
            if (result == null)
            {
                return NotFound(new { message = "Documento no encontrado" });
            }

            var (fileBytes, fileName) = result.Value;
            return File(fileBytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al descargar documento: {ex.Message}");
            return StatusCode(500, new { message = "Error al descargar documento" });
        }
    }

    [HttpDelete("{documentId}")]
    public async Task<IActionResult> DeleteDocument(string documentId)
    {
        try
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new { message = "No autenticado" });
            }

            await _firebaseService.DeleteDocumentAsync(documentId, userId);
            _logger.LogInformation($"Documento eliminado: {documentId} por usuario {userId}");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error al eliminar documento: {ex.Message}");
            return StatusCode(500, new { message = "Error al eliminar documento" });
        }
    }
}
