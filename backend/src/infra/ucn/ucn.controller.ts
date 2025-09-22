// controller web que expone los proxies seguros
import { Controller, Get, Param, Query } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AvanceGateway, LoginGateway, MallasGateway } from './ucn.gateways';

class LoginDto {
  @IsString() @IsNotEmpty() email!: string;
  @IsString() @IsNotEmpty() password!: string;
}

class MallaParamsDto {
  @IsString() @IsNotEmpty() cod!: string;
  @IsString() @IsNotEmpty() catalogo!: string;
}

class AvanceQueryDto {
  @IsString() @IsNotEmpty() rut!: string;
  @IsString() @IsNotEmpty() codcarrera!: string;
}

@ApiTags('ucn')
@Controller('ucn')
export class UcnController {
  constructor(
    private readonly loginGw: LoginGateway,
    private readonly mallasGw: MallasGateway,
    private readonly avanceGw: AvanceGateway,
  ) {}

  @Get('login')
  @ApiOperation({ summary: 'Login UCN' })
  @ApiQuery({ name: 'email', required: true })
  @ApiQuery({ name: 'password', required: true })
  @ApiResponse({ status: 200 })
  login(@Query() q: LoginDto): Promise<unknown> {
    return this.loginGw.login(q.email, q.password);
  }

  @Get('malla/:cod/:catalogo')
  @ApiOperation({ summary: 'Obtener malla' })
  @ApiResponse({ status: 200 })
  malla(@Param() p: MallaParamsDto): Promise<unknown> {
    return this.mallasGw.malla(p.cod, p.catalogo);
  }

  @Get('avance')
  @ApiOperation({ summary: 'Obtener avance' })
  @ApiQuery({ name: 'rut', required: true })
  @ApiQuery({ name: 'codcarrera', required: true })
  @ApiResponse({ status: 200 })
  avance(@Query() q: AvanceQueryDto): Promise<unknown> {
    return this.avanceGw.avance(q.rut, q.codcarrera);
  }
}
