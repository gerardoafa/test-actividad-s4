namespace ActividadS4.API.DTOs;

/// <summary>
/// MovieDto es el objeto que se envia al frontend cuando pide peliculas el user
/// NO expone toda la informacion interna, solo cuando es necesario mostrarla
/// </summary>
public class RegisterDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Name { get; set; }
}