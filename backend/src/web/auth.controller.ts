// controlador de autenticacion demo actualizado a email para login y rut para recuperar
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';

type Carrera = { codigo: string; nombre: string; catalogo: string };
type User = { rut: string; email: string; password: string; carreras: Carrera[] };

const demoUsers: User[] = [
  {
    rut: '333333333',
    email: 'juan@example.com',
    password: '1234',
    carreras: [{ codigo: '8606', nombre: 'ICCI', catalogo: '201610' }],
  },
  {
    rut: '222222222',
    email: 'maria@example.com',
    password: 'abcd',
    carreras: [{ codigo: '8266', nombre: 'ITI', catalogo: '202410' }],
  },
  {
    rut: '111111111',
    email: 'ximena@example.com',
    password: 'qwerty',
    carreras: [{ codigo: '8606', nombre: 'ICCI', catalogo: '201610' }],
  },
];

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const user = demoUsers.find(
      (u) => u.email.toLowerCase() === email && u.password === password,
    );
    if (!user) throw new BadRequestException('credenciales invalidas');
    return { rut: user.rut, carreras: user.carreras };
  }

  @Post('forgot')
  forgot(@Body() body: { rut?: string }) {
    const rut = (body.rut || '').trim();
    if (!rut) throw new BadRequestException('rut requerido');
    const user = demoUsers.find((u) => u.rut === rut);
    if (!user) throw new BadRequestException('rut no registrado');
    return {
      ok: true,
      message: `se envio un correo temporal a ${user.email}`,
    };
  }
}

